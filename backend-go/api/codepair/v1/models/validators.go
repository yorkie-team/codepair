package models

func (r *HelloRequest) Validate() error {
	if r.Nickname == "" {
		return RequiredFieldError("nickname")
	}

	if len(r.Nickname) < 2 {
		return MinLengthError("nickname", 2)
	}

	return nil
}
