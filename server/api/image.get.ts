import {defineEventHandler} from 'h3';
import {findImages} from "~/server/services/publicData";

export default defineEventHandler(() => findImages());
