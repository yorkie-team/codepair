import { Injectable } from "@nestjs/common";

@Injectable()
export class ContentSanitizer {
	private readonly SECRET_PATTERNS = [
		/sk-[a-zA-Z0-9]{48}/g, // OpenAI API Key
		/ghp_[a-zA-Z0-9]{36}/g, // GitHub PAT
		/gho_[a-zA-Z0-9]{36}/g, // GitHub OAuth Token
		/ghu_[a-zA-Z0-9]{36}/g, // GitHub User Token
		/ghs_[a-zA-Z0-9]{36}/g, // GitHub Server Token
		/ghr_[a-zA-Z0-9]{36}/g, // GitHub Refresh Token
		/AKIA[0-9A-Z]{16}/g, // AWS Access Key
		/AIza[0-9A-Za-z-_]{35}/g, // Google API Key
		/ya29\.[0-9A-Za-z-_]+/g, // Google OAuth Token
		/[0-9]+-[0-9A-Za-z_]{32}\.apps\.googleusercontent\.com/g, // Google OAuth Client ID
	];

	/**
	 * Sanitize content by removing sensitive information
	 */
	sanitize(content: string): string {
		let sanitized = content;

		// 1. API Keys & Tokens
		for (const pattern of this.SECRET_PATTERNS) {
			sanitized = sanitized.replace(pattern, "[REDACTED]");
		}

		// 2. Email addresses
		sanitized = sanitized.replace(
			/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
			"[EMAIL]"
		);

		// 3. Internal/Private URLs
		sanitized = sanitized.replace(
			/https?:\/\/(localhost|127\.0\.0\.1|192\.168\.[0-9.]+|10\.[0-9.]+|172\.(1[6-9]|2[0-9]|3[0-1])\.[0-9.]+)(:[0-9]+)?/gi,
			"[INTERNAL_URL]"
		);

		// 4. JWT Tokens
		sanitized = sanitized.replace(
			/eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
			"[JWT_TOKEN]"
		);

		// 5. Generic long alphanumeric strings (potential tokens)
		// Only match if they are standalone (not part of code)
		sanitized = sanitized.replace(/\b[a-f0-9]{32,}\b/gi, "[TOKEN]");

		// 6. Private key blocks
		sanitized = sanitized.replace(
			/-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
			"[PRIVATE_KEY]"
		);

		// 7. AWS Secret Access Keys
		sanitized = sanitized.replace(/[A-Za-z0-9/+=]{40}/g, (match) => {
			// Only replace if it looks like base64 and is likely a secret
			if (match.includes("/") || match.includes("+")) {
				return "[SECRET_KEY]";
			}
			return match;
		});

		return sanitized;
	}

	/**
	 * Check if content contains sensitive information
	 */
	hasSensitiveInfo(content: string): boolean {
		// Use search() or match() instead of test() to avoid /g flag state issues
		for (const pattern of this.SECRET_PATTERNS) {
			// Reset lastIndex to avoid stateful behavior
			pattern.lastIndex = 0;
			if (pattern.test(content)) {
				pattern.lastIndex = 0; // Reset after test
				return true;
			}
		}

		// Check for private keys
		if (content.includes("-----BEGIN") && content.includes("PRIVATE KEY-----")) {
			return true;
		}

		return false;
	}
}
