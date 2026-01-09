# AppFeedback Ranking Algorithm v1.0.0

This document describes the open-source ranking algorithm used to prioritize feedback items.

## Score Formula

```
Score = (votes * W_votes) + (recency * W_recency) + (feasibility * W_feasibility) + (impact * W_impact) + (clarity * W_clarity)
```

## Weights

| Factor | Weight | Description |
|--------|--------|-------------|
| `W_votes` | 1.0 | Community vote count (upvotes - downvotes) |
| `W_recency` | 0.5 | Time decay factor |
| `W_feasibility` | 0.3 | AI-assessed technical complexity |
| `W_impact` | 0.4 | AI-assessed user benefit |
| `W_clarity` | 0.2 | AI-assessed description quality |

## Factor Calculations

### Votes
- Raw count of upvotes minus downvotes
- Can be negative if more downvotes

### Recency Factor
```python
days_old = (now - created_at).days
recency = max(0, 1.0 - (days_old * 0.1 / 7))
```
- Starts at 1.0 for new items
- Decays by 0.1 per week
- Minimum of 0

### Feasibility Score (0-1)
AI-assessed based on:
- Technical complexity
- Required resources
- Alignment with existing architecture
- Risk level

### Impact Score (0-1)
AI-assessed based on:
- Number of users affected
- Frequency of use case
- Pain point severity
- Business value

### Clarity Score (0-1)
AI-assessed based on:
- Description completeness
- Reproducibility (for bugs)
- Use case examples
- Acceptance criteria

## Example Calculation

```
Item: "Add dark mode toggle"
- votes: 15
- days_old: 3
- feasibility: 0.8
- impact: 0.7
- clarity: 0.9

recency = max(0, 1.0 - (3 * 0.1 / 7)) = 0.957

Score = (15 * 1.0) + (0.957 * 0.5) + (0.8 * 0.3) + (0.7 * 0.4) + (0.9 * 0.2)
      = 15 + 0.479 + 0.24 + 0.28 + 0.18
      = 16.179
```

## Proposing Changes

To propose changes to this algorithm:

1. Open an issue describing the problem with current ranking
2. Propose new weights or factors with justification
3. Provide example calculations showing improvement
4. Community discussion and voting
5. PR to update this file and implementation

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2024 | Initial algorithm |
