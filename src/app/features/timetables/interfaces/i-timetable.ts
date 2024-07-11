export interface ITimetable extends ITimetableDto {
  id?: string;
}

export interface ITimetableDto {
  name: string;
  description?: string;
  startYear?: number;
  endYear?: number;
  semester?: number;
  parameters?: string;
}
