import {defineEventHandler, getHeader} from 'h3';
import {verifyToken} from "~/server/services/jwtTokenService";

export default defineEventHandler(async (event) => {
    if (!event.path.startsWith('/api/v1/')) {
        return
    }

    const authHeader = getHeader(event, 'authorization')

    await verifyToken(authHeader)
})
