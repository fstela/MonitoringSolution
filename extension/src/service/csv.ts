import * as xlsx from "xlsx";

export const importCsvFile = (data: any) => {
  const wb = xlsx.read(new Uint8Array(data), { type: "array" });
  const sheet_name_list = wb.SheetNames;
  return xlsx.utils.sheet_to_json(wb.Sheets[sheet_name_list[0]]);
};
