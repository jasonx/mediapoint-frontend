import { AnswerYesNo } from 'src/app/core/enums/answer-yes-no.enum';

export function convertBooleanToAnswer(
  value: AnswerYesNo | boolean
): AnswerYesNo {
  return value ? AnswerYesNo.Yes : AnswerYesNo.No;
}

export function convertAnswerToBoolean(
  value: AnswerYesNo.Yes | AnswerYesNo.No | boolean
): boolean {
  return value === AnswerYesNo.Yes;
}
