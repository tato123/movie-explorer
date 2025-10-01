#!/usr/bin/env node

/**
 * Claude Code Commit Command
 *
 * Analyzes git diffs and generates commit messages grouped by workspace packages.
 *
 * Usage:
 *   /commit [verbosity:brief|standard|detailed] [exclude:pkg1,pkg2] [include:pkg1,pkg2] [instructions:"custom"]
 */

export default async function commit(claude) {
  const { args } = claude;

  // Parse command arguments
  const verbosity = args.verbosity || 'standard';
  const excludePackages = args.exclude ? args.exclude.split(',').map(p => p.trim()) : [];
  const includePackages = args.include ? args.include.split(',').map(p => p.trim()) : [];
  const customInstructions = args.instructions || '';

  // Validate verbosity level
  const validVerbosity = ['brief', 'standard', 'detailed'];
  if (!validVerbosity.includes(verbosity)) {
    throw new Error(`Invalid verbosity level: ${verbosity}. Must be one of: ${validVerbosity.join(', ')}`);
  }

  await claude.ask(`I'm analyzing the git changes in your repository to generate a commit message.

**Configuration:**
- Verbosity: ${verbosity}
${excludePackages.length > 0 ? `- Excluded packages: ${excludePackages.join(', ')}` : ''}
${includePackages.length > 0 ? `- Included packages: ${includePackages.join(', ')}` : ''}
${customInstructions ? `- Custom instructions: ${customInstructions}` : ''}

Let me gather the git status and diffs...`, { role: 'assistant' });

  // Get git status
  const statusResult = await claude.bash('git status --porcelain');
  const diffStagedResult = await claude.bash('git diff --cached');
  const diffUnstagedResult = await claude.bash('git diff');

  if (!statusResult.stdout && !diffStagedResult.stdout && !diffUnstagedResult.stdout) {
    await claude.ask('No changes detected in the repository. Nothing to commit.', { role: 'assistant' });
    return;
  }

  // Build the prompt for commit message generation
  const prompt = `
You are tasked with generating a conventional commit message for a monorepo project.

## Repository Structure
This is a Turborepo monorepo with the following packages:
- apps/webapp - Next.js web application
- packages/api-client - REST API client library
- packages/eslint-config - Shared ESLint configuration
- packages/typescript-config - Shared TypeScript configuration

## Git Status
\`\`\`
${statusResult.stdout || 'No staged/unstaged files'}
\`\`\`

## Staged Changes (git diff --cached)
\`\`\`
${diffStagedResult.stdout || 'No staged changes'}
\`\`\`

## Unstaged Changes (git diff)
\`\`\`
${diffUnstagedResult.stdout || 'No unstaged changes'}
\`\`\`

## Instructions

Generate a conventional commit message with the following requirements:

1. **Verbosity Level**: ${verbosity}
   - brief: High-level summary only, 1-2 lines in body
   - standard: Moderate detail, list main changes per package
   - detailed: Include file-level changes and specific modifications

2. **Package Filtering**:
   ${excludePackages.length > 0 ? `- Exclude these packages: ${excludePackages.join(', ')}` : ''}
   ${includePackages.length > 0 ? `- Only include these packages: ${includePackages.join(', ')}` : ''}

3. **Custom Instructions**: ${customInstructions || 'None'}

4. **Format**:
   - Use conventional commit format: \`<type>(<scope>): <subject>\`
   - Types: feat, fix, docs, style, refactor, test, chore, perf
   - Scope: Package name (e.g., api-client, webapp, eslint-config) or "root" for root-level changes
   - If multiple packages are affected, use comma-separated scopes or "monorepo"
   - Subject: Concise description (50 chars or less)
   - Body: Group changes by package with clear headings
   - Highlight breaking changes if any
   - Focus on "why" not "what"
   - End with:

     🤖 Commit summary generated with [Claude Code](https://claude.com/claude-code)

     All code architected by Jonathan Fontanez and represents original design
     and implementation in compliance with review standards.

5. **Analysis**:
   - Identify the primary type of change (feat, fix, etc.)
   - Group changes by workspace package
   - Determine if changes are breaking
   - Extract the key intent behind the changes

Please provide the complete commit message ready to use with \`git commit -m "$(cat <<'EOF' ... EOF)"\`

Only output the commit message text, nothing else.
`;

  await claude.ask(prompt, { role: 'user' });

  // Wait for Claude to generate the commit message
  // The response will be the commit message itself
}