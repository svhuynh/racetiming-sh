import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { ParticipantsService } from '../participants.service';
import { RacesService } from '../races.service';
import { ActivatedRoute } from '@angular/router';
import { EventsService } from '../events.service';
import { DataTableComponent } from '../data-table/data-table.component';
import { SnackBarService, MessageType } from '../snack-bar.service';
import * as XLSX from 'xlsx';
import { Observable } from 'rxjs/Observable';

type AOA = any[][];

@Component({
  selector: 'app-file-reader',
  templateUrl: './file-reader.component.html',
  styleUrls: ['./file-reader.component.css']
})
export class FileReaderComponent implements OnInit {
  data: AOA = [[1, 2], [3, 4]];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  columns: any = [];
  attributeCount = 0;
  @ViewChild(DataTableComponent) dataTable: DataTableComponent;
  public eventId: number;
  public races: any;
  @Output() fileUploadStarted: EventEmitter<any> = new EventEmitter();
  @Output() fileUploadDone: EventEmitter<any> = new EventEmitter();
  @Input() selectedRace: any;

  public participant = {
    FirstName: '',
    LastName: '',
    Gender: null,
    BirthDate: null,
    Age: null,
    Email: '',
    PostalCode: '',
    Statut: '',
    RegistrationDate: null,
    Phone: '',
    Team: '',
    BibNo: null,
    Attribute01: '',
    Attribute02: '',
    Attribute03: '',
    Attribute04: '',
    Attribute05: '',
    Place: ''
  };

  constructor(private participantsService: ParticipantsService,
    private racesService: RacesService,
    private route: ActivatedRoute,
    private eventsService: EventsService,
    private snackBarService: SnackBarService) { }

  ngOnInit() {
    this.eventId = parseInt(this.route.snapshot.paramMap.get('eventId'));
  }

  handleFileInput(files: File) {
    this.attributeCount = 0;

    if (!!files[0]) {
      this.fileUploadStarted.emit();
      this.participantsService.deleteParticipants(this.eventId, this.selectedRace.Id)
        .then(() => {
          const reader: FileReader = new FileReader();

          reader.onload = (e: any) => {
            const bstr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'buffer' });
            const wsname: string = wb.SheetNames[0];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];
            this.data = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1, range: this.update_sheet_range(ws) }));
            this.parseData(this.data);
          };

          reader.readAsArrayBuffer(files[0]);
        }).catch(error =>
          console.error(error)
        );
    }
  }

  update_sheet_range(ws) {
    const range = { s: { r: 20000000, c: 20000000 }, e: { r: 0, c: 0 } };
    Object.keys(ws).filter(function (x) { return x.charAt(0) !== '!'; }).map(XLSX.utils.decode_cell).forEach(function (x) {
      range.s.c = Math.min(range.s.c, x.c); range.s.r = Math.min(range.s.r, x.r);
      range.e.c = Math.max(range.e.c, x.c); range.e.r = Math.max(range.e.r, x.r);
    });
    return ws['!ref'] = XLSX.utils.encode_range(range);
  }

  parseData(data: any) {
    const columns = data[0];
    const participant = this.participant;
    let column: any;

    for (let i = 0; i < columns.length; i++) {
      // Get column names
      column = columns[i];
      this.columnName(column);
    }

    let addParticipantPromises = [];
    for (let j = 1; j < data.length; j++) {
      for (let k = 0; k < columns.length; k++) {
        column = this.columns[k];
        if (column === 'Gender') {
          if (typeof data[j][k] !== 'undefined') {
            switch (((data[j][k].toString()).toLowerCase()).trim()) {
              case 'homme': case 'h': case '0': data[j][k] = 0; break;
              case 'femme': case 'f': case '1': data[j][k] = 1; break;
              default: data[j][k] = 2; break;
            }
          }
        }
        if (column === ('BirthDate' || 'RegistrationDate')) {
          if (typeof data[j][k] !== 'undefined') {
            if (data[j][k].charAt(4) === '-' && data[j][k].charAt(7) === '-') {
              data[j][k] = new Date(
                parseInt(data[j][k].split('-')[0]),
                parseInt(data[j][k].split('-')[1]) - 1,
                parseInt(data[j][k].split('-')[2])
              );
            } else if (data[j][k].charAt(4) === '/' && data[j][k].charAt(7) === '/') {
              data[j][k] = new Date(
                parseInt(data[j][k].split('/')[0]),
                parseInt(data[j][k].split('/')[1]) - 1,
                parseInt(data[j][k].split('/')[2])
              );
            }
          }
        }
        participant[column] = data[j][k];
      }
      addParticipantPromises.push(this.participantsService.addParticipant(this.eventId, this.selectedRace.Id, participant));
    }

    Promise.all(addParticipantPromises)
      .then(() => {
        let plural = addParticipantPromises.length > 1 ? 's' : '';
        this.snackBarService.open('Participant' + plural + ' ajouté' + plural, MessageType.Success);
      }).catch(error => {
        this.snackBarService.open("Erreur lors de l'ajout d'un ou de plusieurs participants", MessageType.Error);
      }).then(() => {
        this.fileUploadDone.emit();
      });
  }

  columnName(column: any) {
    switch ((column.toLowerCase()).trim()) {
      case 'firstname':
      case 'firstnames':
      case 'first name':
      case 'first names':
      case 'prénom':
      case 'prénoms':
      case 'prenom':
      case 'prenoms':
        this.columns.push('FirstName');
        break;
      case 'lastname':
      case 'lastnames':
      case 'last name':
      case 'last names':
      case 'nom':
      case 'noms':
        this.columns.push('LastName');
        break;
      case 'gender':
      case 'genders':
      case 'sexe':
      case 'sexes':
        this.columns.push('Gender');
        break;
      case 'birthdate':
      case 'birthdates':
      case 'birth date':
      case 'birth dates':
      case 'naissance':
      case 'naissances':
      case 'date de naissance':
      case 'dates de naissance':
        this.columns.push('BirthDate');
        break;
      case 'age':
      case 'ages':
      case 'âge':
      case 'âges':
        this.columns.push('Age');
        break;
      case 'email':
      case 'mail':
      case 'courriel':
      case 'courriels':
        this.columns.push('Email');
        break;
      case 'status':
      case 'état':
      case 'états':
      case 'statut':
      case 'statuts':
      case 'state':
      case 'states':
        this.columns.push('Statut');
        break;
      case 'registrationdate':
      case 'registration':
      case 'registration date':
      case "date d'inscription":
      case "dates d'inscription":
      case 'inscription':
        this.columns.push('RegistrationDate');
        break;
      case 'phone number':
      case 'phone numbers':
      case 'phone':
      case 'phones':
      case 'téléphone':
      case 'téléphones':
      case 'numéro de téléphone':
      case 'numéros de téléphone':
      case 'telephone':
      case 'telephones':
      case 'numero de telephone':
      case 'numeros de telephone':
        this.columns.push('Phone');
        break;
      case 'team':
      case 'teams':
      case 'équipe':
      case 'équipes':
      case 'equipe':
      case 'equipes':
      case 'team name':
      case 'team names':
      case 'teamname':
      case 'teamnames':
      case "nom d'équipe":
      case "noms d'équipe":
      case "nom d'equipe":
      case "noms d'equipe":
        this.columns.push('Team');
        break;
      case 'bibno':
      case 'bibnos':
      case 'dossard':
      case 'dossards':
      case 'bib':
      case 'bibs':
      case 'bib number':
      case 'bib numbers':
      case 'bibnumber':
      case 'bibnumbers':
      case 'numéro de dossard':
      case 'numéros de dossard':
      case 'numero de dossard':
      case 'numeros de dossard':
        this.columns.push('BibNo');
        break;
      case 'code postal':
      case 'codes postaux':
      case 'postalcode':
      case 'postalcodes':
      case 'postal code':
      case 'postal codes':
        this.columns.push('PostalCode');
        break;
      case 'place':
      case 'adresse':
      case 'adresses':
      case 'address':
        this.columns.push('Place');
        break;
      default:
        if (this.attributeCount < 5) {
          this.attributeCount++;
          this.columns.push('Attribute0' + this.attributeCount);
        } else {
          this.snackBarService.open('Trop de colonnes personnalisées', MessageType.Warning);
        }
        break;
    }
  }
}
