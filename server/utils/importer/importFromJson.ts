import type {PostInterface} from "~/server/models/post";
import Post, {getPostSchemaValidator} from "~/server/models/post";
import {AiHttpClient} from "~/server/services/aiHttpClient";
import {sanitizeContent} from "~/server/services/contentSanitizer";
import {extractPostFromFile} from "~/server/services/postExtractor";
import type {MultiPartData} from "h3";

export interface ImportResult {
    posts: {
        success: number
        error: number
        total: number
    }
    // Raisons des échecs (IA indisponible, réponse illisible…), affichées dans la file d'import
    errors?: string[]
}

// Fichier .json : un texte ({postTitle, author, content, publishDate?}) ou un tableau de textes
export async function importFromJson(json: { data: MultiPartData[] }): Promise<ImportResult[]> {
    const posts: PostInterface[] = [];
    const errors: string[] = [];

    for (const file of json.data) {
        try {
            const parsed = JSON.parse(file.data.toString('utf8'));
            posts.push(...(Array.isArray(parsed) ? parsed : [parsed]));
        } catch {
            errors.push(`${file.filename ?? 'Fichier'} : JSON illisible`);
        }
    }

    const result = await importPosts(posts);
    return [{
        posts: {
            success: result.posts.success,
            error: result.posts.error + errors.length,
            total: result.posts.total + errors.length,
        },
        errors,
    }];
}

export async function importFromText(files: { data: MultiPartData[] }): Promise<ImportResult[]> {
    const {data} = files;

    return await Promise.all([
        getPostsFromTextFiles(data),
    ]);
}

async function getPostsFromTextFiles(files: MultiPartData[]): Promise<ImportResult> {

    const aiApi = new AiHttpClient();
    const errors: string[] = [];

    const texts = await Promise.all(
        files.map(async (file) => {
            try {
                if (file.filename === undefined) {
                    return null;
                }
                const fileExtension = file.filename.split('.').pop() || '';
                return await extractPostFromFile(file.data, fileExtension, aiApi);
            } catch (e) {
                console.error('error', e);
                errors.push(e instanceof Error ? e.message : String(e));
                return null;
            }
        })
    );

    const validTexts = texts.filter((t): t is PostInterface => t !== null);
    const result = await importPosts(validTexts);
    const failed = texts.length - validTexts.length;

    return {
        posts: {
            success: result.posts.success,
            error: result.posts.error + failed,
            total: result.posts.total + failed,
        },
        errors,
    };
}

async function importPosts(posts: PostInterface[]): Promise<ImportResult> {

    const resultImport = await Promise.all(posts.map(async (post) => {
        const isValid = getPostSchemaValidator().safeParse(post).success;
        if (!isValid) {
            console.error('invalid post', post);
            return false;
        }

        let date = new Date(post.publishDate);
        if (isNaN(date.getTime())) {
            date = new Date();
        }

        const content = sanitizeContent(post.content);

        try {
            await Post.create({
                postTitle: post.postTitle,
                author: post.author,
                content: content,
                attachments: typeof post.attachments === 'string' ? post.attachments : null,
                publishDate: date,
            });
        } catch (error) {
            console.error('import: enregistrement impossible', error);
            return false;
        }

        return true;
    }));

    return {
        posts: {
            success: resultImport.filter(item => item === true).length,
            error: resultImport.filter(item => item === false).length,
            total: resultImport.length,
        }
    };
}
