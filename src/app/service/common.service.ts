import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CommonService {

    private NET_SPEED_TEST_SIZE = 0.009765625;
    private TEST_TIME = 20;

    constructor(
        private http: HttpClient
    ) {

    }

    private getRequestHeaders(): HttpHeaders {
        return new HttpHeaders({
            Authorization: ''
        });
    }

    private generateRandomData(sizeInBytes: number): string {
        let data = '';
        const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
        for (let index = 0; index < sizeInBytes; index += 1) {
            data += charSet[Math.round(Math.random() * (charSet.length - 1))];
        }
        return data;
    }

    private predictSpeed(bytesLoaded: number, duration: number): number {
        console.log(
            'bytesLoaded : ', bytesLoaded,
            '\nduration : ', duration
        );
        if (duration) {
            const bitsLoaded = bytesLoaded * 8;
            const speedBps = bitsLoaded / duration;
            const speedKbps = speedBps / 1024;
            const speedMbps = Number((speedKbps / 1024).toFixed(2));
            return speedMbps;
        }
        return 0;
    }

    public getDownloadSpeed(): Observable<any> {
        return new Observable((observer) => {
            let requestSub: Subscription;
            const getBytes = () => {
                return new Promise((resolved, rejected) => {
                    let startTime = (new Date()).getTime();
                    let endTime = 0;
                    const downloadSize = this.NET_SPEED_TEST_SIZE * 1024 * 1024;
                    requestSub = this.http.get(
                        environment.URL,
                        {
                            headers: this.getRequestHeaders(),
                            observe: 'events',
                            reportProgress: true,
                        }
                    ).subscribe((event) => {
                        console.log('EVENT : ', event);
                        switch (event.type) {
                            case HttpEventType.ResponseHeader: {
                                startTime = (new Date()).getTime();
                                break;
                            }
                            case HttpEventType.DownloadProgress: {
                                if (event.loaded >= downloadSize) {
                                    endTime = (new Date()).getTime();
                                    const duration = (endTime - startTime) / 1000;
                                    resolved(this.predictSpeed(downloadSize, duration));
                                }
                                break;
                            }
                            case HttpEventType.Response: {
                                endTime = (new Date()).getTime();
                                const duration = (endTime - startTime) / 1000;
                                resolved(this.predictSpeed(downloadSize, duration));
                                break;
                            }
                        }
                    }, (errored: HttpErrorResponse) => {
                        rejected(errored.message);
                    });
                });
            };
            let timer = this.TEST_TIME;
            let requestPromise: any;
            const downInterval = setInterval(() => {
                timer -= 1;
                if (!requestPromise) {
                    requestPromise = getBytes().then((speed) => {
                        if (speed) {
                            observer.next(speed);
                        }
                        requestPromise = undefined;
                    }).catch((err) => {
                        observer.error(err);
                        requestPromise = undefined;
                    });
                }
                if (!timer) {
                    requestSub.unsubscribe();
                    observer.complete();
                    clearInterval(downInterval);
                }
            }, 1000);
        });
    }

    public getUploadSpeed(): Observable<any> {
        return new Observable((observer) => {
            let requestSub: Subscription;
            let totalDuration = 0;
            let totalBytes = 0;
            const getBytes = () => {
                return new Promise((resolved, rejected) => {
                    let startTime = (new Date()).getTime();
                    let endTime = 0;
                    const uploadSize = this.NET_SPEED_TEST_SIZE * 1024 * 1024;
                    totalBytes += uploadSize;
                    requestSub = this.http.post(
                        environment.URL,
                        {
                            data: this.generateRandomData(uploadSize)
                        },
                        {
                            headers: this.getRequestHeaders(),
                            observe: 'events',
                            reportProgress: true,
                        }
                    ).subscribe((event) => {
                        console.log('EVENT : ', event);
                        switch (event.type) {
                            case HttpEventType.Sent: {
                                startTime = (new Date()).getTime();
                                break;
                            }
                            case HttpEventType.UploadProgress: {
                                if (event.loaded >= uploadSize) {
                                    endTime = (new Date()).getTime();
                                    const duration = (endTime - startTime) / 1000;
                                    totalDuration += duration;
                                    requestSub.unsubscribe();
                                    resolved(this.predictSpeed(totalBytes, totalDuration));
                                }
                                break;
                            }
                            case HttpEventType.Response: {
                                endTime = (new Date()).getTime();
                                const duration = (endTime - startTime) / 1000;
                                totalDuration += duration;
                                resolved(this.predictSpeed(totalBytes, totalDuration));
                                break;
                            }
                        }
                    }, (errored: HttpErrorResponse) => {
                        rejected(errored.message);
                    });
                });
            };
            let timer = this.TEST_TIME;
            let requestPromise: any;
            let counter = 0;
            const upInterval = setInterval(() => {
                timer -= 1;
                if (!requestPromise) {
                    console.log('INSTANCE : ', counter++);
                    requestPromise = getBytes().then((speed) => {
                        if (speed) {
                            observer.next(speed);
                        }
                        requestPromise = undefined;
                    }).catch((err) => {
                        observer.error(err);
                        requestPromise = undefined;
                    });
                }
                if (!timer) {
                    requestSub.unsubscribe();
                    observer.complete();
                    clearInterval(upInterval);
                }
            }, 1000);
        });
    }

}
