import { Col, Layout, Row, Spin } from 'antd'
import 'antd/dist/antd.css'
import React, {
  Suspense,
  useCallback,
  useState,
} from 'react'
import useSWR from 'swr'
import './App.css'
import QuizContainer from './components/QuizContainer'
import Quizzes from './components/Quizzes'
import { QuizState } from './types'
const { Content } = Layout

const fetcher = (...args: any) =>
  //@ts-ignore
  fetch(...args).then((res) => res.json())

const App: React.FC = () => {
  const [currentQuiz, setCurrentQuiz] =
    useState<QuizState>()
  const { data: quizzes } = useSWR(
    `${process.env.REACT_APP_BACKEND_URL}/quizzes`,
    fetcher,
    { suspense: true },
  )
  const handleQuizSelected = useCallback(
    (quizId: number) => {
      setCurrentQuiz(
        quizzes.find((q: QuizState) => q.id === quizId),
      )
    },
    [quizzes],
  )
  const handleBackToAllQuizzes = useCallback(() => {
    setCurrentQuiz(undefined)
  }, [])
  console.log('!@r#12')
  return (
    <Layout>
      <Content>
        <Row>
          <Col span={24}>
            <h1
              style={{
                textAlign: 'center',
                marginTop: '20px',
                marginBottom: '20px',
              }}
            >
              Quizzes
            </h1>
          </Col>
          {!currentQuiz && (
            <Suspense fallback={<Spin />}>
              <Quizzes
                quizzes={quizzes}
                onQuizSelected={handleQuizSelected}
              />
            </Suspense>
          )}
          {currentQuiz && (
            <QuizContainer
              quiz={currentQuiz}
              handleBackToQuizzes={handleBackToAllQuizzes}
            />
          )}
        </Row>
      </Content>
    </Layout>
  )
}

export default App
