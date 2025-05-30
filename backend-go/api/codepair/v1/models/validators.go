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

func (r *CreateUploadPresignedUrlRequest) Validate() error {
	if r.WorkspaceId == "" {
		return RequiredFieldError("workspaceId")
	}

	if r.ContentLength < 1 {
		return MinLengthError("contentLength", 1)
	}

	if r.ContentType == "" {
		return RequiredFieldError("contentType")
	}

	return nil
}
