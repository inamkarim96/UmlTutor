# Intial Todo list

- Take current project backup
- delete client 
- Install Next.js with tailwind 
- use the current shad cn library
- use axios to send requests.

# Backend Todo List
- Delete anything related to firestore
- Setup prisma with sqlite database(Check documentation) and use prisma studio for view database items and rows.
- Keep express the current state
- Remove anything related to vite and use tsx library to run servers.
- Use firebase-admin for authentication middlewares.
- While development write each work test case.
    - For example you're writing a student create functiaonlity at the same time use jest to write tests to make the functionality is working through tests as well. 
- Keep server\storage.ts and also update the data into the database. For exmple this API:

```ts
  app.get("/api/user/profile", authenticateToken, async (req: Request, res) => {
    try {
      const userId = Number((req as AuthenticatedRequest).user!.userId);
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch {
      res.status(500).json({ message: "Failed to get user profile" });
    }
  });
```

When you write tests case:

```ts
describe("Main test", () => {
    it("Get user with correct token", () => {
        const response = axios.get("/api/user/profile", {
            headers: {
                Authorization: "Bearer correct-token"
            }
        })
        expect(response.statusCode).toBe(200)
    })
    it("Should fail with wrong token", () => {
        const response = axios.get("/api/user/profile", {
            headers: {
                Authorization: "Bearer lasdflkaskdf"
            }
        })
        const expectedcodes = [400, 401,404, 03]
        expect(expectedCodes.includes(response.statusCode)).toBe(true)
    })
})
```


# Editor 

- Try to use Cursor editor AI which really helps through coding. 
- Try to keep the tasks very simple to Cursor.
- Install Windsurf just like Cursor Editor. 
- Install Zed editor just like Cursor editor.
- Switch between these editors to keep the work with AI.