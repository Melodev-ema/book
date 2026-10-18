import {defineEventHandler} from 'h3';
import Attachment from "~/server/models/attachment";

export default defineEventHandler(async () => {
    //@todo : access control from front only
    return await Attachment.findAll();
});
