import {defineEventHandler, createError, readValidatedBody} from 'h3';
import {z} from 'zod';
import User, {UserRole} from "~/server/models/user";

const bodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

export default defineEventHandler(async (event) => {
    const {email, password} = await readValidatedBody(event, bodySchema.parse);

    const user = await User.findOne({
        where: {
            email: email,
            active: true,
            role: UserRole.ADMIN
        },
    });

    if (!user) {
        throw createError({statusCode: 404, statusMessage: 'Utilisateur non trouvé'})
    }

    const {password: hashedPassword} = user.get({plain: true})

    if (await verifyPassword(hashedPassword, password)) {
        await setUserSession(event, {user});
        return {};
    }

    throw createError({
        statusCode: 401,
        message: 'Bad credentials'
    });
});
