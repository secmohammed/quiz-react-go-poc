package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/render"
)

type QuizSubmissionResponse struct {
	Message string  `json:"message"`
	Result  float64 `json:"result"`
}

type Answer struct {
	Name      string `json:"name"`
	ID        int    `json:"id"`
	isCorrect bool
}
type Question struct {
	ID      int      `json:"id"`
	Name    string   `json:"name"`
	Answers []Answer `json:"answers"`
}
type Quiz struct {
	ID          int        `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Questions   []Question `json:"questions"`
}
type QuizSubmission struct {
	Questions []struct {
		AnswerIDs []int `json:"answer_ids"`
		ID        int   `json:"id"`
	} `json:"questions"`
}

func main() {
	r := chi.NewRouter()
	var quizzes []*Quiz
	quizzes = append(quizzes, &Quiz{
		ID:          1,
		Name:        "Math 1.0",
		Description: "Basics of Math",
		Questions: []Question{
			{
				ID:   1,
				Name: "What's the output of 1+1",
				Answers: []Answer{
					{
						Name:      "2",
						ID:        1,
						isCorrect: true,
					},
					{
						Name:      "1",
						ID:        2,
						isCorrect: false,
					},
					{
						Name:      "3",
						ID:        3,
						isCorrect: false,
					},
					{
						Name:      "4",
						ID:        4,
						isCorrect: false,
					},
				},
			},
			{
				ID:   2,
				Name: "What's the output of 1+2",
				Answers: []Answer{
					{
						Name:      "2",
						ID:        1,
						isCorrect: false,
					},
					{
						Name:      "1",
						ID:        2,
						isCorrect: false,
					},
					{
						Name:      "3",
						ID:        3,
						isCorrect: true,
					},
					{
						Name:      "4",
						ID:        4,
						isCorrect: false,
					},
				},
			},
			{
				ID:   3,
				Name: "What's the output of 1+3",
				Answers: []Answer{
					{
						Name:      "2",
						ID:        1,
						isCorrect: false,
					},
					{
						Name:      "1",
						ID:        2,
						isCorrect: false,
					},
					{
						Name:      "3",
						ID:        3,
						isCorrect: false,
					},
					{
						Name:      "4",
						ID:        4,
						isCorrect: true,
					},
				},
			},
			{
				ID:   4,
				Name: "What's the output of 0+1",
				Answers: []Answer{
					{
						Name:      "2",
						ID:        1,
						isCorrect: true,
					},
					{
						Name:      "1",
						ID:        2,
						isCorrect: false,
					},
					{
						Name:      "3",
						ID:        3,
						isCorrect: false,
					},
					{
						Name:      "4",
						ID:        4,
						isCorrect: false,
					},
				},
			},
		},
	}, &Quiz{
		ID:          2,
		Name:        "Math 2.0",
		Description: "More Basics of Math",
		Questions: []Question{
			{
				ID:   1,
				Name: "What's the output of 1+1",
				Answers: []Answer{
					{
						Name:      "2",
						ID:        1,
						isCorrect: true,
					},
					{
						Name:      "1",
						ID:        2,
						isCorrect: false,
					},
					{
						Name:      "3",
						ID:        3,
						isCorrect: false,
					},
					{
						Name:      "4",
						ID:        4,
						isCorrect: false,
					},
				},
			},
			{
				ID:   2,
				Name: "What's the output of 1+2",
				Answers: []Answer{
					{
						Name:      "2",
						ID:        1,
						isCorrect: false,
					},
					{
						Name:      "1",
						ID:        2,
						isCorrect: false,
					},
					{
						Name:      "3",
						ID:        3,
						isCorrect: true,
					},
					{
						Name:      "4",
						ID:        4,
						isCorrect: false,
					},
				},
			},
			{
				ID:   3,
				Name: "What's the output of 1+3",
				Answers: []Answer{
					{
						Name:      "2",
						ID:        1,
						isCorrect: false,
					},
					{
						Name:      "1",
						ID:        2,
						isCorrect: false,
					},
					{
						Name:      "3",
						ID:        3,
						isCorrect: false,
					},
					{
						Name:      "4",
						ID:        4,
						isCorrect: true,
					},
				},
			},
			{
				ID:   4,
				Name: "What's the output of 0+1",
				Answers: []Answer{
					{
						Name:      "2",
						ID:        1,
						isCorrect: true,
					},
					{
						Name:      "1",
						ID:        2,
						isCorrect: false,
					},
					{
						Name:      "3",
						ID:        3,
						isCorrect: false,
					},
					{
						Name:      "4",
						ID:        4,
						isCorrect: false,
					},
				},
			},
		},
	})

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))
	r.Use(render.SetContentType(render.ContentTypeJSON))
	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"https://*", "http://*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))
	r.Post("/api/quizzes/result/{id}", func(writer http.ResponseWriter, request *http.Request) {
		id := chi.URLParam(request, "id")
		if id == "" {
			http.Error(writer, "Invalid ID Passed", 404)
			return
		}
		quizID, err := strconv.Atoi(id)
		if err != nil {
			http.Error(writer, "Quiz not found", 404)
			return
		}
		var currentQuiz *Quiz
		for _, quiz := range quizzes {

			if quiz.ID == quizID {
				currentQuiz = quiz
			}
		}
		if currentQuiz == nil {
			http.Error(writer, "Quiz not found", 404)
			return
		}
		quizSubmissionBody := new(QuizSubmission)
		err = json.NewDecoder(request.Body).Decode(&quizSubmissionBody)
		if err != nil {
			http.Error(writer, "invalid body submitted", 422)
			return
		}
		if len(currentQuiz.Questions) != len(quizSubmissionBody.Questions) {
			http.Error(writer, "You didn't solve all of the questions of that quiz", 422)
			return
		}
		questionsWithCorrectAnswers := make(map[int][]int, 0)
		for _, question := range currentQuiz.Questions {
			for _, answer := range question.Answers {
				if answer.isCorrect {
					questionsWithCorrectAnswers[question.ID] = append(questionsWithCorrectAnswers[question.ID], answer.ID)
				}
			}
		}
		totalScore := 0.0
		for _, questionIdWithAnswers := range quizSubmissionBody.Questions {
			score := 0.0
			if answers, ok := questionsWithCorrectAnswers[questionIdWithAnswers.ID]; ok {

				for _, submittedAnswer := range questionIdWithAnswers.AnswerIDs {
					for _, answer := range answers {
						if submittedAnswer == answer {
							score++

						}
					}
				}
				totalScore += score / float64(len(answers))
				score = 0

			}
		}
		totalScore = totalScore / float64(len(currentQuiz.Questions)) * 100
		result := QuizSubmissionResponse{Message: fmt.Sprintf("your result is %v%s", totalScore, "%"), Result: totalScore}
		res, err := json.Marshal(&result)
		if err != nil {
			http.Error(writer, http.StatusText(500), 500)
			return
		}
		writer.Write(res)
	})
	r.Get("/api/quizzes", func(w http.ResponseWriter, r *http.Request) {

		quizBytes, err := json.Marshal(quizzes)
		if err != nil {
			http.Error(w, http.StatusText(500), 500)
			return
		}
		w.Write(quizBytes)
	})
	http.ListenAndServe(":8000", r)

}
