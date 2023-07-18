import { Component, OnInit, ViewChild } from '@angular/core';
import { BoxesService, Box } from '../boxes.service';
import { DataTableComponent } from '../data-table/data-table.component';
import { SnackBarService, MessageType } from '../snack-bar.service';

@Component({
  selector: 'app-available-boxes',
  templateUrl: './available-boxes.component.html',
  styleUrls: ['./available-boxes.component.css']
})
export class AvailableBoxesComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTable: DataTableComponent;
  public fieldsDescription: any;
  public areBoxesLoading: boolean;

  constructor(private boxesService: BoxesService,
    private snackBarService: SnackBarService) { 
    this.fieldsDescription = Box.fieldsDescription;
    
  }

  ngOnInit() {
    this.dataTable.defaultSettings();
    this.areBoxesLoading = true;
    this.boxesService.getBoxes()
    .then(boxes => {
      this.dataTable.setDataSource(boxes);
    }).catch(error => console.error(error))
    .then(() => {
      this.areBoxesLoading = false;
    });
  }

  refreshBoxes() {
    this.dataTable.setDataSource([]);
    this.areBoxesLoading = true;
    this.boxesService.getBoxes()
      .then(boxes => {
        if (boxes != null) {
          this.dataTable.setDataSource(boxes);
        }
      }).catch(error => {
        this.snackBarService.open("Erreur lors du chargement des boites", MessageType.Error);
        console.error(error);
      }).then(() => {
        this.dataTable.clearSelection();
        this.areBoxesLoading = false;
      });
  }

  public onDeleteSelection(boxes): void {
    boxes.forEach(box => {
      if (box != null) {
        this.boxesService.deleteBox(box.Id)
          .then(() => {
            let message = boxes.length > 1 ? "Boites supprimées" : "Boite supprimée";
            this.snackBarService.open(message, MessageType.Success);
          }).catch(error => {
            this.snackBarService.open("Erreur lors de la suppression", MessageType.Error);
            console.error(error);
          }).then(() => {
            this.dataTable.clearSelection();
          });
      }
    });
  }

  public onAddClick() {
    this.dataTable.openAddDialog("Ajouter une boite", new Box());
  }

  public onAddSave(box) {
    this.boxesService.addBox(box)
      .then(() => {
        this.snackBarService.open("Boite ajoutée", MessageType.Success);
      }).catch(error => {
        this.snackBarService.open("Erreur lors de la création", MessageType.Error);
        console.error(error);
      }).then(() => {
        this.refreshBoxes();
      });
  }

  public onEditSelection(box): void {

    this.boxesService.updateBox(box)
      .then(() => {
        this.snackBarService.open("Élément modifié", MessageType.Success);
      }).catch(error => {
        this.snackBarService.open("Erreur lors de la modification", MessageType.Error);
        console.error(error);
      }).then(() => {
        this.dataTable.clearSelection();
        this.refreshBoxes();
      });

  }

}
