import { HttpStatus, INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { fakeData } from '../core/test/helper';
import { initTestModule } from '../core/test/initTest';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand, BrandStatus } from './brand.entity';
import { BrandService } from './brand.service';

describe('BrandController', () => {
    let app: INestApplication;
    let adminToken: string;
    let brandService: BrandService;

    beforeAll(async () => {
        const { getApp, superAdminToken } = await initTestModule();
        app = getApp;

        adminToken = superAdminToken.token;
        brandService = await app.resolve<BrandService>(BrandService);
    });

    describe('POST /', () => {
        const reqApi = (dto: CreateBrandDto) =>
            supertest(app.getHttpServer())
                .post(`/api/v1/brand`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        it('Pass', async () => {
            const res = await reqApi({
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrl: fakeData(10, 'lettersAndNumbersLowerCase'),
                status: BrandStatus.ACTIVE,
            });

            expect(res.status).toBe(HttpStatus.CREATED);
        });

        it('Fail Duplicate Name', async () => {
            const dto: CreateBrandDto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrl: fakeData(10, 'lettersAndNumbersLowerCase'),
                status: BrandStatus.ACTIVE,
            };

            dto.code = fakeData(10, 'lettersAndNumbersLowerCase');

            await reqApi(dto);
            const res = await reqApi(dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it('Fail Duplicate Code', async () => {
            const dto: CreateBrandDto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrl: fakeData(10, 'lettersAndNumbersLowerCase'),
                status: BrandStatus.ACTIVE,
            };

            dto.name = fakeData(10, 'lettersAndNumbersLowerCase');

            await reqApi(dto);
            const res = await reqApi(dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    describe('PUT /:id', () => {
        const reqApi = (id: string, dto: UpdateBrandDto) =>
            supertest(app.getHttpServer())
                .put(`/api/v1/brand/${id}`)
                .set({ authorization: 'Bearer ' + adminToken })
                .send(dto);

        let brand: Brand;

        beforeEach(async () => {
            brand = await brandService.createOne({
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrl: fakeData(10, 'lettersAndNumbersLowerCase'),
                status: BrandStatus.ACTIVE,
            });
        });

        it('Pass', async () => {
            const res = await reqApi(brand.id, {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                status: BrandStatus.ACTIVE,
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrl: fakeData(10, 'lettersAndNumbersLowerCase'),
            });

            expect(res.status).toBe(HttpStatus.OK);
        });

        it('Fail Duplicate Name', async () => {
            const dto: UpdateBrandDto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                status: BrandStatus.ACTIVE,
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrl: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            dto.code = fakeData(10, 'lettersAndNumbersLowerCase');

            await brandService.createOne(dto);
            const res = await reqApi(brand.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it('Fail Duplicate Code', async () => {
            const dto: UpdateBrandDto = {
                description: fakeData(10, 'lettersAndNumbersLowerCase'),
                name: fakeData(10, 'lettersAndNumbersLowerCase'),
                status: BrandStatus.ACTIVE,
                code: fakeData(10, 'lettersAndNumbersLowerCase'),
                imageUrl: fakeData(10, 'lettersAndNumbersLowerCase'),
            };

            dto.name = fakeData(10, 'lettersAndNumbersLowerCase');

            await brandService.createOne(dto);
            const res = await reqApi(brand.id, dto);

            expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
