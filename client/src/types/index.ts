export type QuizState = {
  id: number
  name: string
  description: string
  questions: {
    id: number
    name: string
    answers: {
      id: number
      name: string
    }[]
  }[]
}
export type QuestionAnswer = {
  id: number
  answer_ids: number[]
}
export type QuizResultResponse = {
  message: string
  result: number
}
