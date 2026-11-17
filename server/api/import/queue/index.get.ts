import {defineEventHandler} from 'h3';
import {requireUserSession} from '~/server/utils/session';
import {getJobs} from "~/server/services/importQueue";

export default defineEventHandler(async (event) => {
    await requireUserSession(event);

    return {jobs: getJobs()};
});
