package models

import "errors"

func RequiredFieldError(field string) error {
	return errors.New(field + " is required")
}

func MinLengthError(field string, min int) error {
	return errors.New(field + " must be at least " + string(min) + " characters")
}
