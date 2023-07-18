import { CommonModule, registerLocaleData  } from '@angular/common';

// Angular
import { NgModule, LOCALE_ID  } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DndModule } from "ngx-drag-drop";
import { AgmCoreModule } from '@agm/core';

import { EventsService } from './events.service';
import { RacesService } from './races.service';
import { ParticipantsService } from './participants.service';
import { AnnouncerService } from './announcer.service';
import { SnackBarService } from './snack-bar.service';
import { SideNavService } from './side-nav.service';
import { TimingService } from './timing.service';
import { BibsService } from './bibs.service';
import { BoxesService } from './boxes.service';
import { ReportsService } from './reports.service';
import { ColorSchemeService } from './color-scheme.service';
import { ResultsService } from './results.service';
import { PasscodeService } from './passcode.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { ClipboardModule } from 'ngx-clipboard';

import localeFrCa from '@angular/common/locales/fr-CA';

registerLocaleData(localeFrCa);

// Angular Material
import {MatCardModule,
  MatTableModule,
  MatDialogModule,
  MatButtonModule,
  MatGridListModule,
  MatTabsModule,
  MatIconModule,
  MatMenuModule,
  MatToolbarModule,
  MatSidenavModule,
  MatListModule,
  MatPaginatorModule,
  MatPaginatorIntl,
  MatSortModule,
  MatExpansionModule,
  MatTooltipModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatSnackBarModule,
  MatCheckboxModule,
  MatSlideToggleModule,
  MatRadioModule,
  MatButtonToggleModule
} from '@angular/material';

import { AppComponent } from './app.component';
import { EventsComponent } from './events/events.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HomePageComponent } from './home-page/home-page.component';
import { AnnouncerComponent } from './announcer/announcer.component';
import { ParticipantsComponent } from './participants/participants.component';
import { AboutComponent } from './about/about.component';
import { TimingComponent } from './timing/timing.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { ResultsComponent } from './results/results.component';
import { RaceEditorComponent } from './race-editor/race-editor.component';
import { RaceVisuComponent } from './race-visu/race-visu.component';
import { DateUtcPipe } from './date-utc.pipe';
import { SnackBarComponent } from './snack-bar/snack-bar.component';
import { DataTableComponent } from './data-table/data-table.component';
import { DataTableAnnouncerComponent } from './data-table-announcer/data-table-announcer.component';
import { RowEditDialogComponent } from './row-edit-dialog/row-edit-dialog.component';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';
import { FileReaderComponent } from './file-reader/file-reader.component';
import { DateTimeUtcPipe } from './date-time-utc.pipe';
import { DuplicateRaceComponent } from './duplicate-race/duplicate-race.component';
import { BoxesActivityComponent } from './boxes-activity/boxes-activity.component';
import { ParticipantsResultsComponent } from './participants-results/participants-results.component';
import { FilteredTimesComponent } from './filtered-times/filtered-times.component';
import { AvailableBoxesComponent } from './available-boxes/available-boxes.component';
import { BibsComponent } from './bibs/bibs.component';
import { DownloadExcelFileComponent } from './download-excel-file/download-excel-file.component';
import { DataTablePipe } from './data-table.pipe';
import { ReportsComponent } from './reports/reports.component';
import { ResultsOptionsComponent } from './results-options/results-options.component';
import { PublicResultsComponent } from './public-results/public-results.component';
import { AccountsComponent } from './accounts/accounts.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './AuthGuard';
import { LoginService } from './login.service';
import { WarningDialogComponent } from './warning-dialog/warning-dialog.component';
import { ToMeterPipe } from './to-meter.pipe';
import { RawTimesDialogComponent } from './raw-times-dialog/raw-times-dialog.component';
import { getFrenchPaginatorIntl } from './data-table/data-table.component';

const appRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: HomePageComponent, canActivate: [AuthGuard], data: {page: 'login'} },
  { path: 'public-results/:eventId', component: PublicResultsComponent },
  { path: 'app', component: AppComponent,
    children: [
      { path: 'events', component: EventsComponent, canActivate: [AuthGuard], data: {page: 'events'} },
      { path: 'availableBoxes', component: AvailableBoxesComponent, canActivate: [AuthGuard], data: {page: 'boxes'} },
      { path: 'timing/:eventId', component: TimingComponent, canActivate: [AuthGuard], data: {page: 'timing'} },
      { path: 'events/:eventId', component: ConfigurationComponent, canActivate: [AuthGuard], data: {page: 'configuration'} },
      { path: 'participants/:eventId', component: ParticipantsComponent, canActivate: [AuthGuard], data: {page: 'participants'} },
      { path: 'bibs/:eventId', component: BibsComponent, canActivate: [AuthGuard], data: {page: 'bibs'} },
      { path: 'announcer/:eventId', component: AnnouncerComponent, canActivate: [AuthGuard], data: {page: 'announcer'} },
      { path: 'results/:eventId', component: ResultsComponent, canActivate: [AuthGuard], data: {page: 'results'} },
      { path: 'about', component: AboutComponent, canActivate: [AuthGuard], data: {page: 'about'} },
      { path: 'events/races/:eventId/:raceId', component: RaceEditorComponent, canActivate: [AuthGuard], data: {page: 'race-editor'} },
      { path: 'accounts', component: AccountsComponent, canActivate: [AuthGuard], data: {page: 'accounts'} },
      { path: '**', component: PageNotFoundComponent }
    ]
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    HomeComponent,
    AppComponent,
    EventsComponent,
    PageNotFoundComponent,
    HomePageComponent,
    AnnouncerComponent,
    AboutComponent,
    ParticipantsComponent,
    TimingComponent,
    ConfigurationComponent,
    ResultsComponent,
    RaceEditorComponent,
    RaceVisuComponent,
    DateUtcPipe,
    SnackBarComponent,
    DataTableComponent,
    DataTableAnnouncerComponent,
    RowEditDialogComponent,
    DeleteDialogComponent,
    FileReaderComponent,
    DateTimeUtcPipe,
    DuplicateRaceComponent,
    BoxesActivityComponent,
    ParticipantsResultsComponent,
    FilteredTimesComponent,
    AvailableBoxesComponent,
    BibsComponent,
    DownloadExcelFileComponent,
    DataTablePipe,
    ReportsComponent,
    ResultsOptionsComponent,
    PublicResultsComponent,
    AccountsComponent,
    WarningDialogComponent,
    ToMeterPipe,
    RawTimesDialogComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatTabsModule,
    MatIconModule,
    MatToolbarModule,
	  MatTableModule,
    MatSidenavModule,
	  MatDialogModule,
    MatListModule,
    MatMenuModule,
  	MatSortModule,
	  MatPaginatorModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DndModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatButtonToggleModule,
    ClipboardModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false }
    ),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDqesNbib2LtKk82Wd9LQyCGyy0OEhzkWQ',
      libraries: ["places"]
    })
  ],
  providers: [
    EventsService,
    RacesService,
    ParticipantsService,
    SnackBarService,
    SideNavService,
    AnnouncerService,
    TimingService,
    BibsService,
    BoxesService,
    ColorSchemeService,
    ResultsService,
    ReportsService,
    AuthGuard,
    LoginService,
    PasscodeService,
    { provide: LOCALE_ID, useValue: "fr-CA" },
    { provide: MatPaginatorIntl, useValue: getFrenchPaginatorIntl() }
  ],
  bootstrap: [HomeComponent],
  entryComponents: [
    DeleteDialogComponent,
    SnackBarComponent,
    RowEditDialogComponent,
    DuplicateRaceComponent,
    WarningDialogComponent,
    RawTimesDialogComponent
  ]
})
export class AppModule { }