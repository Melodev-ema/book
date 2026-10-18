import {defineEventHandler} from 'h3';
import {findBookConfig} from "~/server/services/publicData";

export default defineEventHandler(() => findBookConfig());
