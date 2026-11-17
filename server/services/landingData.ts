import type {BookConfigState} from "~/stores/bookStore";
import type {AttachmentEntityInterface} from "~/entities/AttachmentEntity";
import type {LandingContent, LandingToc} from "~/utils/landingContent";
import {findBookConfig, findBookToc, findImages, findSiteConfig} from "~/server/services/publicData";

export interface LandingData {
    bookConfig: BookConfigState;
    siteConfig: LandingContent;
    toc: LandingToc;
    imagePages: AttachmentEntityInterface[];
}

// Mêmes valeurs que les GET /api/book-config, site-config, book-toc et image, réduites à leur forme JSON
export const loadLandingData = async (): Promise<LandingData> => {
    const [bookConfig, siteConfig, toc, imagePages] = await Promise.all([
        findBookConfig(),
        findSiteConfig(),
        findBookToc(),
        findImages(),
    ]);
    return JSON.parse(JSON.stringify({bookConfig, siteConfig, toc, imagePages}));
};
