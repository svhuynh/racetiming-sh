export class FieldDescription {
  displayName: string;
  inputType: string;
  maxLength?: number
  required?: boolean;
  step?: number;
  min?: number;
  max?: number;
  pipe: string = '';
  disabled?: boolean;
  fieldName?: string;
}

export class FirstNameDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Prénom";
    this.inputType = "text";
    this.maxLength = 40;
    this.required = true;
  }
}

export class LastNameDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Nom";
    this.inputType = "text";
    this.maxLength = 40;
    this.required = true;
  }
}

export class BibNoDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Dossard";
    this.inputType = "number";
  }
}

export class PositionDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Split (km)";
    this.inputType = "number";
    this.pipe = "meter";
  }
}

export class ChipTimeDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Heure de passage";
    this.inputType = "time";
    this.pipe = "time";
  }
}

export class BoxNoDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Numéro de boite";
    this.inputType = "number";
  }
}

export class DateModifiedDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Dernière modification";
    this.inputType = "text";
    this.maxLength = 80;
  }
}

export class GenderDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Sexe";
    this.fieldName = "Gender";
    this.inputType = "number"; // To verify
    this.pipe = "gender";
  }
}

export class RegistrationDateDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Date d'inscription";
    this.inputType = "date";
    this.pipe = "date";
  }
}

export class BirthDateDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Date de naissance";
    this.inputType = "date";
    this.pipe = "date";
  }
}

export class AgeDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Âge";
    this.fieldName = "Age";
    this.inputType = "number";
    this.step = 1;
  }
}

export class EmailDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Courriel";
    this.inputType = "email";
    this.maxLength = 80;
  }
}

export class PostalCodeDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Code postal";
    this.inputType = "text";
  }
}

export class StatusDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Statut";
    this.inputType = "text";
    this.maxLength = 40;
  }
}

export class PhoneDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Téléphone";
    this.inputType = "phone";
  }
}

export class TeamDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Équipe";
    this.inputType = "text";
  }
}

export class PlaceDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Adresse";
    this.inputType = "text";
    this.maxLength = 80;
  }
}

export class CustomAttributeDescription extends FieldDescription {
  fieldName: string;
  constructor(number: number) {
    super();
    this.displayName = "Attribut " + number;
    this.inputType = "text";
    this.fieldName = "Attribute0" + number;
  }
}

export class ChipDescription extends FieldDescription {
  constructor(number: number) {
    super();
    this.displayName = "Puce " + number;
    this.inputType = "text";
  }
}

export class BoxNameDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Nom de boîte";
    this.inputType = "text";
    this.maxLength = 40;
    this.required = true;
  }
}

export class BoxIpDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "IP de boite";
    this.inputType = "text";
    this.maxLength = 40;
    this.required = true;
  }
}

export class PositionDescriptionComboBox extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Split (km)";
    this.inputType = "mat-select position";
  }
}

export class GGRankDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Position (Sexe)";
    this.inputType = "text";
    this.maxLength = 40;
  }
}

export class GunTimeDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Temps Gun";
    this.inputType = "text";
    this.maxLength = 40;
  }
}

export class OGRankDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Position";
    this.inputType = "text";
    this.maxLength = 40;
  }
}

export class LastChipTimeDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Temps Puce";
    this.inputType = "text";
    this.maxLength = 40;
  }
}

export class FinishTimeDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Heure d'arrivée";
    this.inputType = "time";
    this.pipe = "time";
    this.maxLength = 40;
  }
}

export class GenderDescriptionComboBox extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Sexe";
    this.inputType = "mat-select gender";
    this.pipe = "gender";
  }
}

export class RhythmDescription extends FieldDescription {
  constructor(unit: string = '') {
    super();
    this.displayName = "Rythme (" + unit + ")";
    this.inputType = "number";
    this.pipe = unit;
  }
}

export class CategoryDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Catégorie";
    this.inputType = "text";
  }
}

export class CategoryRankDescription extends FieldDescription {
  constructor() {
    super();
    this.displayName = "Position (Catégorie)";
    this.inputType = "number";
  }
}