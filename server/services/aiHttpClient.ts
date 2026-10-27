interface AiPromptMessage {
    role: string;
    content: string;
}

interface AiResponse {
    choices: AiResponseChoice[];
}

interface AiResponseChoice {
    message: AiResponseMessage;
}

interface AiResponseMessage {
    content: string;
}

class AiRequestBody {
    public model: string;
    public messages: AiPromptMessage[];

    constructor(model: string, messages: AiPromptMessage[]) {
        this.model = model;
        this.messages = messages;
    }
}

// Endpoint compatible OpenAI de Gemini
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/';

// Erreurs passagères (surcharge, quota) : on réessaie après ces délais
const RETRYABLE_STATUSES = [429, 500, 502, 503, 504];
const DEFAULT_RETRY_DELAYS_MS = [2000, 5000, 10000];

export class AiHttpClient {

    private readonly _url: string;
    private readonly _model: string;
    private readonly _apiKey: string;
    private readonly _retryDelaysMs: number[];

    constructor(retryDelaysMs: number[] = DEFAULT_RETRY_DELAYS_MS) {
        this._retryDelaysMs = retryDelaysMs;
        // Gemini si une clé est configurée, sinon serveur local (Ollama) via AI_API_URL
        if (process.env.GEMINI_API_KEY) {
            this._url = GEMINI_API_URL;
            this._model = process.env.GEMINI_MODEL as string;
            this._apiKey = process.env.GEMINI_API_KEY;
        } else {
            this._url = process.env.AI_API_URL + 'v1/';
            this._model = process.env.AI_MODEL as string;
            this._apiKey = '';
        }
    }

    async post(body: AiRequestBody): Promise<AiResponse> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (this._apiKey) {
            headers.Authorization = `Bearer ${this._apiKey}`;
        }

        for (let attempt = 0; ; attempt++) {
            const response = await fetch(this._url + 'chat/completions', {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });

            if (response.ok) {
                return response.json();
            }

            const text = await response.text();
            if (!RETRYABLE_STATUSES.includes(response.status)) {
                throw new Error(`AI API error ${response.status}: ${text}`);
            }
            if (attempt >= this._retryDelaysMs.length) {
                console.error(`AI API error ${response.status}: ${text}`);
                throw new Error(`L’IA est surchargée (erreur ${response.status}), réessayez dans quelques minutes`);
            }
            await new Promise((resolve) => setTimeout(resolve, this._retryDelaysMs[attempt]));
        }
    }

    generatePromptFromText(text: string): AiPromptMessage[] {
        return [
            {
                role: 'system',
                content: 'You are a helpful assistant who extracts structured data from raw text documents.',
            },
            {
                role: 'user',
                content: `Vous recevez en entrée un texte brut. Votre tâche est de :

                1. Extraire les informations suivantes :
                   - postTitle : le titre du document.
                   - author : le nom de l’auteur.
                   - content : Le corps du texte, restitué intégralement, avec uniquement le nettoyage décrit au point 2. Retirer le "postTitle" du "content". Conserver les retours à la ligne et les sauts de paragraphe.
                   - publishDate : la date de publication, au format ISO “YYYY-MM-DD”.

                2. Nettoyer le "content", et seulement de cette façon :
                   - Supprimer les caractères de mise en forme parasites : astérisques (*), dièses (#), tirets bas (_), accents graves (\`), puces isolées, séparateurs décoratifs (par exemple "* * *" ou "---").
                   - Supprimer les données redondantes : toute ligne qui ne donne que l’auteur et/ou la date (en-tête ou signature, par exemple "J.D. (le 12 mars 2021)" ou "12/03/2021 - J.D."), car l’auteur et la date sont affichés à part à partir de "author" et "publishDate".
                   - Supprimer les restes de liens, d’images ou de légendes qui ne font pas partie du texte (par exemple "Voir la vidéo", "Lien :", "[image]").
                   - Ne pas supprimer les vers répétés volontairement (refrains).
                   - Ne rien reformuler, ne rien corriger, ne rien ajouter : les mots et la ponctuation du texte restent identiques.

                3. Produire **uniquement** un **objet JSON** exactement dans ce format, sans commentaire, explication ou champ supplémentaire :
                
                {
                  "postTitle": "…",
                  "author": "…",
                  "content": "…",
                  "publishDate": "YYYY-MM-DD"
                }
                
                4. Ne rien retourner d’autre que cet objet JSON.

                En dehors du nettoyage du point 2, ne modifiez en rien le texte qui suit : ne rajoutez ni ponctuation, ni explications, ni formatage.
                Texte du document :
                ---
                ${text}
                ---`,
            },
        ];
    }

    public async getDocumentInformation(text: string): Promise<AiResponse> {
        const prompt = this.generatePromptFromText(text);

        const aiRequestBody = new AiRequestBody(this._model, prompt);
        return await this.post(aiRequestBody);
    }
}
