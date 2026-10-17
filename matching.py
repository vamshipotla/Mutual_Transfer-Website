"""Cycle matching. Node = user. Edge u->v: u wants v's station and |rank(u)-rank(v)| <= K.
A cycle u1->u2->...->uk->u1 means each user moves to the next user's station."""
from collections import deque, namedtuple

P = namedtuple("P", "id station choices rank")


def build_graph(people, k):
    """people: list of P sorted by priority (highest first)."""
    order = {p.id: i for i, p in enumerate(people)}
    by_st = {}
    for p in people:
        by_st.setdefault(p.station, []).append(p)
    adj = {p.id: [] for p in people}
    radj = {p.id: [] for p in people}
    for p in people:
        seen = set()
        for st in p.choices:
            for v in by_st.get(st, ()):
                if v.id != p.id and v.id not in seen and abs(p.rank - v.rank) <= k:
                    seen.add(v.id)
                    adj[p.id].append(v.id)
                    radj[v.id].append(p.id)
    for a in adj.values():
        a.sort(key=order.get)  # admin first, then earliest entry
    return adj, radj


def find_cycle(start, adj, radj, max_len, blocked=frozenset(), skip=frozenset(), budget=100000):
    """Shortest cycle through `start` (length 2..max_len), avoiding `skip` users and `blocked` groups."""
    dist = {start: 0}  # dist[v] = shortest path length v -> start
    q = deque([start])
    while q:
        u = q.popleft()
        if dist[u] >= max_len - 1:
            continue
        for w in radj.get(u, ()):
            if w not in dist and w not in skip:
                dist[w] = dist[u] + 1
                q.append(w)
    steps = [budget]

    def dfs(path, size):
        u = path[-1]
        if len(path) == size:
            if start in adj.get(u, ()) and frozenset(path) not in blocked:
                return list(path)
            return None
        for v in adj.get(u, ()):
            steps[0] -= 1
            if steps[0] < 0:
                return None
            if v in skip or v in path or v == start:
                continue
            if dist.get(v, 99) <= size - len(path):
                path.append(v)
                r = dfs(path, size)
                path.pop()
                if r:
                    return r
        return None

    for size in range(2, max_len + 1):
        r = dfs([start], size)
        if r:
            return r
    return None
