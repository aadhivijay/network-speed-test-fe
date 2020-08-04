import { Component, OnInit } from '@angular/core';

import { CommonService } from 'src/app/service/common.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    public title = 'SPEED TEST';
    public downloadSpeed = 0;
    public uploadSpeed = 0;
    public lowSpeedMark = 0.10;
    public mediumSpeedMark = 0.150;
    public highSpeedMark = 150;
    public links = [
        {
            label: 'TWITTER',
            value: 'https://twitter.com/ravjduker'
        },
        {
            label: 'LINKEDIN',
            value: 'https://www.linkedin.com/in/ravjduker'
        },
        {
            label: 'INSTAGRAM',
            value: 'https://www.instagram.com/ravjduker'
        }
    ];

    constructor(
        private commonService: CommonService
    ) {

    }

    ngOnInit(): void {
        // this.predictDownloadSpeed();
        // this.predictUploadSpeed();
    }

    private predictDownloadSpeed(): void {
        this.commonService.getDownloadSpeed().subscribe(
            (value) => {
                this.downloadSpeed = value;
            },
            (error) => {
                this.downloadSpeed = error;
            },
            () => {}
        );
    }

    private predictUploadSpeed(): void {
        this.commonService.getUploadSpeed().subscribe(
            (value) => {
                this.uploadSpeed = value;
            },
            (error) => {
                this.uploadSpeed = error;
            },
            () => {}
        );
    }
}
