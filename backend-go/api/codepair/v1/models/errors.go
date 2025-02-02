package models

import (
	"errors"
	"fmt"
)

func RequiredFieldError(field string) error {
	return errors.New(field + " is required")
}

func MinLengthError(field string, min int) error {
	return errors.New(fmt.Sprintf("%s must be at least %d characters", field, min))
}
