import { Module } from '@nestjs/common';
import { createClient } from 'redis';
import { NKConfig } from '../../NKConfig';
import * as Redis from 'redis';
import { FirebaseService } from './firebase.service';
//---- Utils

//---- Service

@Module({
    imports: [],
    controllers: [],
    providers: [FirebaseService],
    exports: [FirebaseService],
})
export class FirebaseModule {}
