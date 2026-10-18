import {defineEventHandler} from 'h3';
import {findSiteConfig} from "~/server/services/publicData";

export default defineEventHandler(() => findSiteConfig());
