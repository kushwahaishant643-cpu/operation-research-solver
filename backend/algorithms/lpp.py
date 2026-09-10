import itertools
import math


def solve_graphical_lpp(objective_coefficients, constraints, optimization="max"):
    """
    Solve a two-variable Linear Programming Problem
    using the graphical method.

    objective_coefficients:
        [coefficient of x1, coefficient of x2]

    constraints:
        [
            {
                "coefficients": [a, b],
                "operator": "<=",
                "rhs": c
            }
        ]

    optimization:
        "max" or "min"
    """

    if len(objective_coefficients) != 2:
        raise ValueError("The graphical method requires exactly two variables.")

    if not constraints:
        raise ValueError("At least one constraint is required.")

    # Store all boundary lines.
    boundaries = []

    for constraint in constraints:
        coefficients = constraint.get("coefficients")
        operator = constraint.get("operator")
        rhs = constraint.get("rhs")

        if not coefficients or len(coefficients) != 2:
            raise ValueError("Each constraint must contain two coefficients.")

        if operator not in ["<=", ">=", "="]:
            raise ValueError("Constraint operator must be <=, >=, or =.")

        if rhs is None:
            raise ValueError("Each constraint must have a right-hand-side value.")

        a = float(coefficients[0])
        b = float(coefficients[1])
        c = float(rhs)

        if a == 0 and b == 0:
            raise ValueError("A constraint cannot have both coefficients equal to zero.")

        boundaries.append((a, b, c))

    # Add non-negativity boundaries:
    # x1 = 0 and x2 = 0
    boundary_lines = boundaries + [
        (1.0, 0.0, 0.0),
        (0.0, 1.0, 0.0)
    ]

    candidate_points = []

    # Find intersections of every pair of boundary lines.
    for line1, line2 in itertools.combinations(boundary_lines, 2):
        a1, b1, c1 = line1
        a2, b2, c2 = line2

        determinant = a1 * b2 - a2 * b1

        # Parallel lines have no unique intersection.
        if math.isclose(determinant, 0.0, abs_tol=1e-10):
            continue

        x1 = (c1 * b2 - c2 * b1) / determinant
        x2 = (a1 * c2 - a2 * c1) / determinant

        candidate_points.append((x1, x2))

    def is_feasible(x1, x2):
        # Non-negativity conditions.
        if x1 < -1e-9 or x2 < -1e-9:
            return False

        # Check every original constraint.
        for constraint in constraints:
            a, b = constraint["coefficients"]
            operator = constraint["operator"]
            rhs = constraint["rhs"]

            lhs = a * x1 + b * x2

            if operator == "<=":
                if lhs > rhs + 1e-9:
                    return False

            elif operator == ">=":
                if lhs < rhs - 1e-9:
                    return False

            elif operator == "=":
                if not math.isclose(lhs, rhs, abs_tol=1e-9):
                    return False

        return True

    # Keep only feasible candidate points.
    feasible_points = []

    for point in candidate_points:
        x1, x2 = point

        if is_feasible(x1, x2):
            if not any(
                math.isclose(x1, p[0], abs_tol=1e-8)
                and math.isclose(x2, p[1], abs_tol=1e-8)
                for p in feasible_points
            ):
                feasible_points.append((x1, x2))

    if not feasible_points:
        return {
            "status": "infeasible",
            "message": "No feasible solution exists.",
            "corner_points": []
        }

    # Calculate objective value at every feasible corner point.
    c1, c2 = objective_coefficients

    evaluated_points = []

    for x1, x2 in feasible_points:
        z = c1 * x1 + c2 * x2

        evaluated_points.append({
            "x1": round(x1, 6),
            "x2": round(x2, 6),
            "z": round(z, 6)
        })

    # Find optimum.
    if optimization.lower() == "max":
        optimal_point = max(evaluated_points, key=lambda point: point["z"])
    elif optimization.lower() == "min":
        optimal_point = min(evaluated_points, key=lambda point: point["z"])
    else:
        raise ValueError("Optimization must be 'max' or 'min'.")

       # Prepare constraint information for the graph
    graph_constraints = []

    for constraint in constraints:
        a = float(constraint["coefficients"][0])
        b = float(constraint["coefficients"][1])
        c = float(constraint["rhs"])

        graph_constraints.append({
            "a": a,
            "b": b,
            "rhs": c,
            "operator": constraint["operator"]
        })
            # Arrange feasible corner points in order
    # so the frontend can draw and shade the feasible region.
    if len(feasible_points) >= 3:
        center_x = sum(point[0] for point in feasible_points) / len(feasible_points)
        center_y = sum(point[1] for point in feasible_points) / len(feasible_points)

        ordered_points = sorted(
            feasible_points,
            key=lambda point: math.atan2(
                point[1] - center_y,
                point[0] - center_x
            )
        )

        feasible_region = [
            {
                "x1": round(point[0], 6),
                "x2": round(point[1], 6)
            }
            for point in ordered_points
        ]
    else:
        feasible_region = [
            {
                "x1": round(point[0], 6),
                "x2": round(point[1], 6)
            }
            for point in feasible_points
        ]
    return {
        "status": "optimal",
        "optimization": optimization.lower(),
        "optimal_solution": optimal_point,
        "corner_points": evaluated_points,
        "graph_constraints": graph_constraints,
        "feasible_region": feasible_region,
        "message": "Optimal solution found successfully."
    }