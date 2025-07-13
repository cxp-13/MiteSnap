1. First think through the problem, read the codebase for relevant files, and write a plan to todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.
8. The generated code. For example, annotations and UI text must be entirely in English

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

# Quick deployment command
When asked to deploy or push changes, follow this flow:
1. Run `npm run build` to check for build errors
2. Run `npm run lint` to check for linting issues  
3. Fix any errors found
4. Add and commit changes with descriptive message
5. Push to GitHub

Command shortcut: "deve" 
- This triggers the full deployment flow: build check → lint check → fix errors → commit → push