/** @format */

import { BackwardOutlined } from '@ant-design/icons'
import {
  Button,
  Col,
  Form,
  Radio,
  Result,
  Space,
  Steps,
  Typography,
} from 'antd'
import {
  FC,
  memo,
  useCallback,
  useMemo,
  useState,
} from 'react'
import {
  QuestionAnswer,
  QuizResultResponse,
  QuizState,
} from '../../types'
const tailLayout = {
  wrapperCol: { span: 16 },
}

const Index: FC<{
  quiz: QuizState
  handleBackToQuizzes: () => void
}> = ({ quiz, handleBackToQuizzes }) => {
  const [quizResult, setQuizResult] =
    useState<QuizResultResponse>()
  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0)
  const [questionAnswer, setQuestionAnswer] = useState<
    QuestionAnswer[]
  >([])
  const [currentStep, setCurrentStep] = useState(0)

  const calculateStepPercentace = useMemo(() => {
    if (currentStep !== 1) {
      return undefined
    }
    return (
      (currentQuestionIndex / (quiz.questions.length - 1)) *
      100
    )
  }, [
    currentStep,
    currentQuestionIndex,
    quiz.questions.length,
  ])
  const handleQuizFinish = useCallback(
    (id: number, questionAnswer: QuestionAnswer[]) => {
      fetch(
        `${process.env.REACT_APP_BACKEND_URL}/quizzes/result/${id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questions: questionAnswer,
          }),
        },
      )
        .then((response) => response.json())
        .then((data) => {
          setQuizResult(data as QuizResultResponse)
        })
        .catch((error) => {})
    },
    [],
  )

  const handleSelectedAnswer = useCallback(
    (questionId: number, answerId: number) => {
      if (
        questionAnswer.findIndex(
          (a) => a.id === questionId,
        ) === -1
      ) {
        setQuestionAnswer([
          ...questionAnswer,
          {
            id: questionId,
            answer_ids: [answerId],
          },
        ])
      } else {
        const newQuestionAnswer = questionAnswer.map(
          (a) => {
            if (a.id === questionId) {
              return {
                ...a,
                answer_ids: [answerId],
              }
            }
            return a
          },
        )
        setQuestionAnswer(newQuestionAnswer)
      }
    },
    [questionAnswer],
  )
  const handleQuizRetake = useCallback(() => {
    setCurrentStep(0)
    setCurrentQuestionIndex(0)
    setQuestionAnswer([])
  }, [])

  const calculateQuizStepStatus = useMemo(() => {
    if (currentStep === 0) {
      return 'wait'
    }
    if (
      currentStep === 1 &&
      calculateStepPercentace !== 100
    ) {
      return 'process'
    }
    if (
      currentStep === 2 &&
      calculateStepPercentace === 100
    ) {
      return 'finish'
    }
  }, [currentStep, calculateStepPercentace])
  return (
    <>
      <Col span={24}>
        <Steps
          current={currentStep}
          percent={calculateStepPercentace}
        >
          <Steps.Step
            title='Start Quiz'
            status={
              currentStep === 0 ? 'process' : 'finish'
            }
          />
          <Steps.Step
            title='Solving Quiz'
            status={calculateQuizStepStatus}
          />
          <Steps.Step
            title='Quiz Result'
            status={quizResult ? 'finish' : 'wait'}
          />
        </Steps>
      </Col>
      <Col span={24}>
        <div className='form'>
          {currentStep === 0 && (
            <>
              <h1>{quiz.name} Quiz</h1>
              <Form>
                <Form.Item>
                  <Button
                    onClick={() => setCurrentStep(1)}
                    type='primary'
                  >
                    Let's get started!
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}
          {currentStep === 1 && (
            <Form layout='vertical'>
              <Form.Item>
                <Space direction='vertical'>
                  <Typography>
                    {
                      quiz.questions[currentQuestionIndex]
                        .name
                    }
                  </Typography>
                  <Radio.Group
                    onChange={(e) =>
                      handleSelectedAnswer(
                        quiz.questions[currentQuestionIndex]
                          .id,
                        e.target.value,
                      )
                    }
                  >
                    <Space direction='vertical'>
                      {quiz.questions[
                        currentQuestionIndex
                      ].answers.map((answer) => (
                        <Radio
                          value={answer.id}
                          key={answer.id}
                        >
                          {answer.name}
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                </Space>
              </Form.Item>

              <Form.Item {...tailLayout}>
                <Space>
                  <Button
                    type='ghost'
                    disabled={currentQuestionIndex === 0}
                    onClick={() =>
                      setCurrentQuestionIndex(
                        currentQuestionIndex - 1,
                      )
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    htmlType='button'
                    disabled={
                      questionAnswer.length ===
                      currentQuestionIndex
                    }
                    onClick={() => {
                      if (
                        currentQuestionIndex ===
                        quiz.questions.length - 1
                      ) {
                        setCurrentStep(2)
                        handleQuizFinish(
                          quiz.id,
                          questionAnswer,
                        )

                        return
                      }
                      setCurrentQuestionIndex(
                        currentQuestionIndex + 1,
                      )
                    }}
                  >
                    {currentQuestionIndex ===
                    quiz.questions.length - 1
                      ? 'Finish'
                      : 'Next'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
          {currentStep === 2 && quizResult && (
            <>
              <Result
                status={
                  quizResult.result > 50
                    ? 'success'
                    : 'error'
                }
                title={
                  quizResult.result > 50
                    ? 'Congratulations!'
                    : 'Oops!'
                }
                subTitle={
                  quizResult.result > 50
                    ? 'You passed the quiz!'
                    : 'You failed the quiz!'
                }
                extra={[
                  <Button
                    type='primary'
                    onClick={handleQuizRetake}
                    key='retake'
                  >
                    Retake {quiz.name}
                  </Button>,
                  <Button
                    key='back'
                    icon={<BackwardOutlined />}
                    onClick={() => handleBackToQuizzes()}
                  >
                    Back to all Quizzes
                  </Button>,
                ]}
              />
            </>
          )}
        </div>
      </Col>
    </>
  )
}
export default memo(Index)
