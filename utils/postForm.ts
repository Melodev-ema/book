// Titre et contenu obligatoires (un éditeur vide contient encore « <p></p> ») : message d'erreur, ou ''
export function missingPostField(post: {postTitle: string; content: string}): string {
    if (!post.postTitle.trim()) {
        return 'Le titre est obligatoire';
    }
    if (!post.content.replace(/<[^>]*>/g, '').trim()) {
        return 'Le contenu est vide';
    }
    return '';
}
