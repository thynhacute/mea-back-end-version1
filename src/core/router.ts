import { NKGlobal } from './common/NKGlobal';
import { NKConfig } from './NKConfig';
import { constant } from './constant';
import { RouterBaseMethodEnum } from './enum/RouterBaseMethodEnum';
import { NKLOGGER_NS, nkLogger, winstonLogger } from './logger';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { kebabCase } from 'lodash';
import moment from 'moment';
import { monoEnum } from 'mono-utils-core';
import morgan from 'morgan';

export let nkShowGetAll = [];

export async function router(app: INestApplication) {
    app.use(cookieParser());
    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.useGlobalPipes(
        new ValidationPipe({
            forbidUnknownValues: false,
        }),
    );

    const configSwagger = new DocumentBuilder()
        .setTitle('Mea API')
        .setDescription('This is maintain by Mea team')
        .setVersion('1.0')
        .addBearerAuth({ name: 'Authentication', bearerFormat: 'Bearer', scheme: 'Bearer', in: 'Header', type: 'http' })
        .build();

    const document = SwaggerModule.createDocument(app, configSwagger);
    const allowRouters = NKGlobal.allowRouters.map((item) => {
        const [apiName, method] = item.split('-');
        return { apiName, method };
    });
    const paths: Record<string, any> = {};
    Object.keys(document.paths).forEach((path) => {
        paths[path] = {};
        Object.keys(document.paths[path]).forEach((method) => {
            const operationId = document.paths[path][method].operationId;

            const action = operationId.split('_')[1];
            const apiName = document.paths[path][method].tags[0];

            const allowRouter = allowRouters.find(
                (item) => kebabCase(item.apiName) === kebabCase(apiName) && item.method === action,
            );
            if (allowRouter || !Object.values(RouterBaseMethodEnum).includes(action)) {
                paths[path][method] = document.paths[path][method];
            }
        });
    });

    SwaggerModule.setup('api/explorer', app, document, {
        patchDocumentOnRequest(req, res, document) {
            return {
                ...document,
                paths,
            } as OpenAPIObject;
        },
    });

    app.use('/api/api-document.json', (req: Request, res: Response) => {
        res.send(document);
    });

    if (NKConfig.NODE_ENV === monoEnum.NODE_ENV_MODE.PRODUCTION) {
        app.use(helmet());
        app.use(compression());
    }

    app.use(
        morgan(function (tokens, req, res) {
            const resStatus = tokens.status(req, res);
            const resTime = tokens['response-time'](req, res);
            const reqMethod = tokens.method(req, res);
            const reqUrl = tokens.url(req, res);
            const reqIp = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const reqDate = tokens['date'](req, res);

            const content = `${moment(reqDate).format(
                'YYYY-MM-DD HH:mm:ss',
            )} ${reqIp} ${reqMethod} ${reqUrl} ${resStatus} - ${resTime} ms`;
            if (resStatus >= 500) {
                winstonLogger.error({
                    resStatus,
                    resTime,
                    reqMethod,
                    reqUrl,
                    reqIp,
                    reqDate,
                });
            } else {
                winstonLogger.info({
                    resStatus,
                    resTime,
                    reqMethod,
                    reqUrl,
                    reqIp,
                    reqDate,
                });
            }
            if (!constant.IGNORE_API_LOG.some((item) => reqUrl.includes(item))) {
                nkLogger(NKLOGGER_NS.HTTP, content);
                if (reqMethod === 'POST' || reqMethod === 'PUT' || reqMethod === 'PATCH') {
                    nkLogger(NKLOGGER_NS.HTTP, JSON.stringify(req.body));
                }
            }
        }),
    );

    app.use((req: Request, res: Response, next: NextFunction) => {
        const origin = req.headers.origin as string;

        // check origin
        // console.log('origin', origin);
        // if (origin) {
        //     if (!NKConfig.CLIENT_URL.includes(origin) && !req.url.includes(constant.OPEN_API_PREFIX)) {
        //         return res.status(403).send('Forbidden');
        //     }
        // }

        res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');

        next();
    });
}
