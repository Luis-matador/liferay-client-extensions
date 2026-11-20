/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import { Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

import { DashboardComponent } from '../dashboard.component';

@NgModule({
	bootstrap: [],
	declarations: [],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		DashboardComponent
	],
	providers: [
		provideHttpClient()
	],
})
export class AppModule {
	constructor(private injector: Injector) {}

	ngDoBootstrap() {
		const DashboardElement = createCustomElement(DashboardComponent, {
			injector: this.injector,
		});

		customElements.define(
			'liferay-sample-custom-element-3',
			DashboardElement
		);
	}
}
