import { RightOutlined } from '@ant-design/icons'
import { Card, List, Row } from 'antd'
import React from 'react'
const Index: React.FC<{
  quizzes: {
    id: number
    name: string
    description: string
  }[]
  onQuizSelected: (id: number) => void
}> = (props) => {
  return (
    <div>
      <Row>
        <List
          style={{ marginBottom: '20px' }}
          grid={{ gutter: 10, xs: 2, md: 3 }}
          size='large'
          dataSource={props.quizzes}
          renderItem={(quiz: {
            id: number
            name: string
            description: string
          }) => (
            <List.Item style={{ marginTop: '20px' }}>
              <Card
                key={quiz.id}
                style={{ width: 300 }}
                cover={
                  <img src='brain.png' alt='Quiz Icon' />
                }
                actions={[
                  <RightOutlined
                    key='start'
                    onClick={() =>
                      props.onQuizSelected(quiz.id)
                    }
                  />,
                ]}
              >
                <Card.Meta
                  title={quiz.name}
                  description={quiz.description}
                />
              </Card>
            </List.Item>
          )}
        />
      </Row>
    </div>
  )
}
export default React.memo(Index)
