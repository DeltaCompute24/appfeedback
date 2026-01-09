# Contributing to the Ranking Algorithm

The AppFeedback ranking algorithm is open source. Anyone can propose changes!

## How to Contribute

### 1. Identify the Problem

Before proposing changes, clearly identify what's wrong with the current ranking:
- Are important items being buried?
- Are low-quality items ranking too high?
- Is there gaming or manipulation?
- Are certain types of feedback underweighted?

### 2. Open an Issue

Create a GitHub issue with:
- **Title**: Clear summary of the problem
- **Current Behavior**: How items are currently ranked
- **Expected Behavior**: How you think they should rank
- **Examples**: Specific items that rank incorrectly
- **Proposed Solution**: High-level idea for fixing it

### 3. Propose Changes

After discussion, submit a PR with:
- Updated `ranking_prompt.md`
- Updated weights or new factors
- Example calculations proving improvement
- Test cases showing edge cases

### 4. Community Review

- Maintainers review for technical feasibility
- Community votes on the change
- Changes require supermajority approval

## Guidelines

### Keep It Simple
- Fewer factors = more understandable
- Weights should be intuitive
- Avoid over-engineering

### Fairness First
- Algorithm should be resistant to gaming
- No single user should dominate
- Fresh content should get a chance

### Transparency
- All factors must be documented
- Calculations should be reproducible
- Changes should be versioned

## What NOT to Change

- Core philosophy of community voting
- Credits distribution logic (separate system)
- Status-based filtering

## Testing Changes

Before proposing, test your changes:

1. Export current item data
2. Apply new algorithm locally
3. Compare rankings
4. Verify improvements outweigh regressions

## Contact

- GitHub Issues: Primary discussion venue
- Email: feedback@b2bee.tech
