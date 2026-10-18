import {createApp, createRouter, toWebHandler, type App} from 'h3';
import jwtAuthenticated from './middleware/jwt-authenticated';
import sessionAuthenticated from './middleware/session-authenticated';
import bookConfigGet from './api/book-config.get';
import bookConfigPut from './api/book-config.put';
import bookTocGet from './api/book-toc.get';
import apiTokenGet from './api/config/api-token.get';
import apiTokenPost from './api/config/api-token.post';
import apiTokenPut from './api/config/api-token.put';
import apiTokenDelete from './api/config/api-token.delete';
import generatePdf from './api/generate-pdf';
import imageGet from './api/image.get';
import importPost from './api/import/index.post';
import importImagePost from './api/import/image/index.post';
import importQueueGet from './api/import/queue/index.get';
import importQueuePost from './api/import/queue/index.post';
import importFluxPost from './api/import/external/flux/index.post';
import loginPost from './api/login.post';
import sessionGet from './api/session.get';
import sessionDelete from './api/session.delete';
import partGet from './api/part/index.get';
import partPost from './api/part/index.post';
import partOrderPut from './api/part/order.put';
import partPut from './api/part/[id].put';
import partDelete from './api/part/[id].delete';
import postGet from './api/post/index.get';
import postPost from './api/post/index.post';
import postOrderPut from './api/post/order.put';
import postByIdGet from './api/post/[id]';
import postDelete from './api/post/[id].delete';
import prospectPost from './api/prospect/index.post';
import siteConfigGet from './api/site-config.get';
import siteConfigPut from './api/site-config.put';
import sitePortraitPost from './api/site-portrait.post';
import statsGet from './api/stats.get';
import v1PostPost from './api/v1/post/index.post';

export function createApiApp(): App {
    const app = createApp();

    app.use(jwtAuthenticated);
    app.use(sessionAuthenticated);

    // Routes statiques (/order) avant les routes à paramètre (/:id)
    const router = createRouter();
    router.get('/api/book-config', bookConfigGet);
    router.put('/api/book-config', bookConfigPut);
    router.get('/api/book-toc', bookTocGet);
    router.get('/api/config/api-token', apiTokenGet);
    router.post('/api/config/api-token', apiTokenPost);
    router.put('/api/config/api-token', apiTokenPut);
    router.delete('/api/config/api-token', apiTokenDelete);
    router.post('/api/generate-pdf', generatePdf);
    router.get('/api/image', imageGet);
    router.post('/api/import', importPost);
    router.post('/api/import/image', importImagePost);
    router.get('/api/import/queue', importQueueGet);
    router.post('/api/import/queue', importQueuePost);
    router.post('/api/import/external/flux', importFluxPost);
    router.post('/api/login', loginPost);
    router.get('/api/session', sessionGet);
    router.delete('/api/session', sessionDelete);
    router.get('/api/part', partGet);
    router.post('/api/part', partPost);
    router.put('/api/part/order', partOrderPut);
    router.put('/api/part/:id', partPut);
    router.delete('/api/part/:id', partDelete);
    router.get('/api/post', postGet);
    router.post('/api/post', postPost);
    router.put('/api/post/order', postOrderPut);
    router.get('/api/post/:id', postByIdGet);
    router.delete('/api/post/:id', postDelete);
    router.post('/api/prospect', prospectPost);
    router.get('/api/site-config', siteConfigGet);
    router.put('/api/site-config', siteConfigPut);
    router.post('/api/site-portrait', sitePortraitPost);
    router.get('/api/stats', statsGet);
    router.post('/api/v1/post', v1PostPost);
    app.use(router);

    return app;
}

export const apiWebHandler = toWebHandler(createApiApp());
