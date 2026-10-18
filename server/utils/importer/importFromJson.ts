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

export async function importFromJson(json: { data: MultiPartData[] }) {
    const {data} = json;

    return await Promise.all([
        importPosts(data),
    ]);
}

export async function importFromText(files: { data: MultiPartData[] }) {
    const {data} = files;

    return await Promise.all([
        getPostsFromTextFiles(data),
    ]);
}

async function getPostsFromTextFiles(files: MultiPartData[]) {

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

        await Post.create({
            postTitle: post.postTitle,
            author: post.author,
            content: content,
            attachments: post.attachments,
            publishDate: date,
        });

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
