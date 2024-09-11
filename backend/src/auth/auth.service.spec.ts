import { ConfigModule } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
	let service: AuthService;
	let jwtService: JwtService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule.forRoot()],
			providers: [
				AuthService,
				{
					provide: UsersService,
					useValue: {
						findOrCreate: jest
							.fn()
							.mockResolvedValue({ id: "123", nickname: "testuser" }),
					},
				},
				{
					provide: JwtService,
					useValue: {
						sign: jest.fn().mockReturnValue("signedToken"),
						verify: jest.fn().mockReturnValue({ sub: "123", nickname: "testuser" }),
					},
				},
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
		jwtService = module.get<JwtService>(JwtService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("getNewAccessToken", () => {
		it("should generate a new access token using refresh token", async () => {
			const newToken = await service.getNewAccessToken("refreshToken");

			expect(newToken).toBe("signedToken");
			expect(jwtService.verify).toHaveBeenCalledWith("refreshToken");
			expect(jwtService.sign).toHaveBeenCalledWith(
				{ sub: "123", nickname: "testuser" },
				expect.any(Object)
			);
		});

		it("should throw an error if refresh token is invalid", async () => {
			jwtService.verify = jest.fn().mockImplementation(() => {
				throw new Error("Invalid token");
			});

			await expect(service.getNewAccessToken("invalidToken")).rejects.toThrow(
				"Invalid token"
			);
		});
	});
});
