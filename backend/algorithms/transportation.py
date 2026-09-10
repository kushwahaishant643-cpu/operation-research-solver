def calculate_total_cost(costs, allocation):
    total_cost = 0

    for i in range(len(allocation)):
        for j in range(len(allocation[0])):
            total_cost += (
                allocation[i][j] * costs[i][j]
            )

    return total_cost


def north_west_corner(costs, supply, demand):
    rows = len(supply)
    columns = len(demand)

    allocation = [
        [0 for _ in range(columns)]
        for _ in range(rows)
    ]

    supply_left = supply.copy()
    demand_left = demand.copy()

    i = 0
    j = 0

    while i < rows and j < columns:

        quantity = min(
            supply_left[i],
            demand_left[j]
        )

        allocation[i][j] = quantity

        supply_left[i] -= quantity
        demand_left[j] -= quantity

        if supply_left[i] == 0 and demand_left[j] == 0:

            if i < rows - 1 and j < columns - 1:
                i += 1
                j += 1
            elif i < rows - 1:
                i += 1
            elif j < columns - 1:
                j += 1
            else:
                break

        elif supply_left[i] == 0:
            i += 1

        elif demand_left[j] == 0:
            j += 1

    return {
        "allocation": allocation,
        "total_cost": calculate_total_cost(
            costs,
            allocation
        )
    }


def least_cost_method(costs, supply, demand):
    rows = len(supply)
    columns = len(demand)

    allocation = [
        [0 for _ in range(columns)]
        for _ in range(rows)
    ]

    supply_left = supply.copy()
    demand_left = demand.copy()

    while True:

        minimum_cost = float("inf")
        selected_i = -1
        selected_j = -1

        for i in range(rows):
            for j in range(columns):

                if (
                    supply_left[i] > 0
                    and demand_left[j] > 0
                    and costs[i][j] < minimum_cost
                ):
                    minimum_cost = costs[i][j]
                    selected_i = i
                    selected_j = j

        if selected_i == -1:
            break

        quantity = min(
            supply_left[selected_i],
            demand_left[selected_j]
        )

        allocation[selected_i][selected_j] = quantity

        supply_left[selected_i] -= quantity
        demand_left[selected_j] -= quantity

    return {
        "allocation": allocation,
        "total_cost": calculate_total_cost(
            costs,
            allocation
        )
    }


def vogel_approximation_method(costs, supply, demand):
    rows = len(supply)
    columns = len(demand)

    allocation = [
        [0 for _ in range(columns)]
        for _ in range(rows)
    ]

    supply_left = supply.copy()
    demand_left = demand.copy()

    active_rows = set(range(rows))
    active_columns = set(range(columns))

    while active_rows and active_columns:

        active_rows = {
            i for i in active_rows
            if supply_left[i] > 0
        }

        active_columns = {
            j for j in active_columns
            if demand_left[j] > 0
        }

        if not active_rows or not active_columns:
            break

        row_penalties = {}

        for i in active_rows:

            available = sorted(
                costs[i][j]
                for j in active_columns
            )

            if len(available) >= 2:
                penalty = available[1] - available[0]
            elif len(available) == 1:
                penalty = available[0]
            else:
                penalty = -1

            row_penalties[i] = penalty

        column_penalties = {}

        for j in active_columns:

            available = sorted(
                costs[i][j]
                for i in active_rows
            )

            if len(available) >= 2:
                penalty = available[1] - available[0]
            elif len(available) == 1:
                penalty = available[0]
            else:
                penalty = -1

            column_penalties[j] = penalty

        max_row_penalty = (
            max(row_penalties.values())
            if row_penalties
            else -1
        )

        max_column_penalty = (
            max(column_penalties.values())
            if column_penalties
            else -1
        )

        if max_row_penalty >= max_column_penalty:

            selected_row = max(
                row_penalties,
                key=row_penalties.get
            )

            selected_column = min(
                active_columns,
                key=lambda j: costs[selected_row][j]
            )

        else:

            selected_column = max(
                column_penalties,
                key=column_penalties.get
            )

            selected_row = min(
                active_rows,
                key=lambda i: costs[i][selected_column]
            )

        quantity = min(
            supply_left[selected_row],
            demand_left[selected_column]
        )

        allocation[selected_row][selected_column] = quantity

        supply_left[selected_row] -= quantity
        demand_left[selected_column] -= quantity

        if supply_left[selected_row] == 0:
            active_rows.discard(selected_row)

        if demand_left[selected_column] == 0:
            active_columns.discard(selected_column)

    return {
        "allocation": allocation,
        "total_cost": calculate_total_cost(
            costs,
            allocation
        )
    }


def build_initial_basis(allocation, costs):
    rows = len(allocation)
    columns = len(allocation[0])

    basis = set()

    for i in range(rows):
        for j in range(columns):
            if allocation[i][j] > 0:
                basis.add((i, j))

    required = rows + columns - 1

    parent = list(
        range(rows + columns)
    )

    def find(x):

        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]

        return x

    def union(a, b):

        root_a = find(a)
        root_b = find(b)

        if root_a == root_b:
            return False

        parent[root_b] = root_a

        return True

    for i, j in sorted(basis):
        union(i, rows + j)

    candidates = []

    for i in range(rows):
        for j in range(columns):

            if (i, j) not in basis:
                candidates.append(
                    (
                        costs[i][j],
                        i,
                        j
                    )
                )

    candidates.sort()

    for _, i, j in candidates:

        if len(basis) >= required:
            break

        if union(i, rows + j):
            basis.add((i, j))

    return basis


def calculate_potentials(costs, basis):
    rows = len(costs)
    columns = len(costs[0])

    u = [None] * rows
    v = [None] * columns

    u[0] = 0

    changed = True

    while changed:

        changed = False

        for i, j in basis:

            if u[i] is not None and v[j] is None:

                v[j] = costs[i][j] - u[i]
                changed = True

            elif v[j] is not None and u[i] is None:

                u[i] = costs[i][j] - v[j]
                changed = True

    return u, v


def calculate_opportunity_costs(
    costs,
    basis,
    u,
    v
):
    rows = len(costs)
    columns = len(costs[0])

    deltas = []

    for i in range(rows):

        row = []

        for j in range(columns):

            if (i, j) in basis:
                delta = 0
            else:
                delta = (
                    costs[i][j]
                    - u[i]
                    - v[j]
                )

            row.append(delta)

        deltas.append(row)

    return deltas


def find_cycle(basis, entering):
    rows = max(
        max(i for i, _ in basis),
        entering[0]
    ) + 1

    columns = max(
        max(j for _, j in basis),
        entering[1]
    ) + 1

    graph = {}

    for i, j in basis:

        r = ("r", i)
        c = ("c", j)

        graph.setdefault(r, []).append(c)
        graph.setdefault(c, []).append(r)

    start = ("r", entering[0])
    target = ("c", entering[1])

    def dfs(node, visited, path):

        if node == target:
            return path

        for next_node in graph.get(node, []):

            if next_node in visited:
                continue

            result = dfs(
                next_node,
                visited | {next_node},
                path + [(node, next_node)]
            )

            if result is not None:
                return result

        return None

    path = dfs(
        start,
        {start},
        []
    )

    if path is None:
        return None

    cycle = [entering]

    for first, second in path:

        if first[0] == "r":

            i = first[1]
            j = second[1]

        else:

            i = second[1]
            j = first[1]

        cycle.append((i, j))

    return cycle


def modi_method(costs, supply, demand):
    rows = len(supply)
    columns = len(demand)

    initial = vogel_approximation_method(
        costs,
        supply,
        demand
    )

    allocation = [
        row.copy()
        for row in initial["allocation"]
    ]

    basis = build_initial_basis(
        allocation,
        costs
    )

    iterations = []

    max_iterations = 100

    for iteration in range(max_iterations):

        u, v = calculate_potentials(
            costs,
            basis
        )

        opportunity_costs = (
            calculate_opportunity_costs(
                costs,
                basis,
                u,
                v
            )
        )

        entering = None
        best_delta = 0

        for i in range(rows):

            for j in range(columns):

                if (i, j) in basis:
                    continue

                if opportunity_costs[i][j] < best_delta:

                    best_delta = (
                        opportunity_costs[i][j]
                    )

                    entering = (i, j)

        iteration_data = {
            "iteration": iteration + 1,
            "u": u.copy(),
            "v": v.copy(),
            "opportunity_costs": [
                row.copy()
                for row in opportunity_costs
            ],
            "entering_cell": (
                [entering[0], entering[1]]
                if entering
                else None
            ),
            "allocation": [
                row.copy()
                for row in allocation
            ]
        }

        if entering is None:

            iterations.append(
                iteration_data
            )

            return {
                "allocation": allocation,
                "total_cost": calculate_total_cost(
                    costs,
                    allocation
                ),
                "iterations": iteration + 1,
                "optimal": True,
                "u": u,
                "v": v,
                "opportunity_costs": opportunity_costs,
                "iteration_details": iterations
            }

        cycle = find_cycle(
            basis,
            entering
        )

        if cycle is None:

            return {
                "allocation": allocation,
                "total_cost": calculate_total_cost(
                    costs,
                    allocation
                ),
                "iterations": iteration + 1,
                "optimal": False,
                "u": u,
                "v": v,
                "opportunity_costs": opportunity_costs,
                "iteration_details": iterations
            }

        plus_cells = []
        minus_cells = []

        for index, cell in enumerate(cycle):

            if index % 2 == 0:
                plus_cells.append(cell)
            else:
                minus_cells.append(cell)

        theta = min(
            allocation[i][j]
            for i, j in minus_cells
        )

        iteration_data["cycle"] = [
            [i, j]
            for i, j in cycle
        ]

        iteration_data["plus_cells"] = [
            [i, j]
            for i, j in plus_cells
        ]

        iteration_data["minus_cells"] = [
            [i, j]
            for i, j in minus_cells
        ]

        iteration_data["theta"] = theta

        for i, j in plus_cells:
            allocation[i][j] += theta

        for i, j in minus_cells:
            allocation[i][j] -= theta

        basis.add(entering)

        leaving_candidates = []

        for cell in minus_cells:

            i, j = cell

            if allocation[i][j] == 0:
                leaving_candidates.append(cell)

        if leaving_candidates:

            leaving = leaving_candidates[-1]

            basis.discard(leaving)

        iterations.append(
            iteration_data
        )

    u, v = calculate_potentials(
        costs,
        basis
    )

    opportunity_costs = (
        calculate_opportunity_costs(
            costs,
            basis,
            u,
            v
        )
    )

    return {
        "allocation": allocation,
        "total_cost": calculate_total_cost(
            costs,
            allocation
        ),
        "iterations": max_iterations,
        "optimal": False,
        "u": u,
        "v": v,
        "opportunity_costs": opportunity_costs,
        "iteration_details": iterations
    }