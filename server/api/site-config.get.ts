import {defineEventHandler} from 'h3';
import SiteConfig from "~/server/models/siteConfig";
import {mergeLandingContent} from "~/utils/landingContent";

export default defineEventHandler(async () => {
    const config = await SiteConfig.findOne();
    return mergeLandingContent(config?.get('content'));
});
