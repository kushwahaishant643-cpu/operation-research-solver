from flask import Flask, jsonify, request
from flask_cors import CORS

from algorithms.lpp import solve_graphical_lpp
from algorithms.transportation import (
    north_west_corner,
    least_cost_method,
    vogel_approximation_method,
    modi_method
)

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return jsonify({
        "message": "Operation Research Smart Solver API is running!",
        "status": "success"
    })


@app.route("/api/test")
def test_api():
    return jsonify({
        "message": "Backend connection successful!",
        "project": "Operation Research Smart Solver"
    })


# ============================================================
# LPP - GRAPHICAL METHOD
# ============================================================

@app.route("/api/lpp/solve", methods=["POST"])
def solve_lpp():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "No JSON data was provided."
            }), 400

        objective = data.get("objective")
        constraints = data.get("constraints")
        optimization = data.get("optimization", "max")

        if objective is None:
            return jsonify({
                "status": "error",
                "message": "Objective function is required."
            }), 400

        if constraints is None:
            return jsonify({
                "status": "error",
                "message": "Constraints are required."
            }), 400

        result = solve_graphical_lpp(
            objective_coefficients=objective,
            constraints=constraints,
            optimization=optimization
        )

        return jsonify(result), 200

    except ValueError as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 400

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": f"An unexpected error occurred: {str(error)}"
        }), 500


# ============================================================
# TRANSPORTATION - NORTH WEST CORNER
# ============================================================

@app.route("/api/transportation/north-west", methods=["POST"])
def solve_transportation_north_west():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "No JSON data was provided."
            }), 400

        costs = data.get("costs")
        supply = data.get("supply")
        demand = data.get("demand")

        if costs is None or supply is None or demand is None:
            return jsonify({
                "status": "error",
                "message": "Costs, supply and demand are required."
            }), 400

        if sum(supply) != sum(demand):
            return jsonify({
                "status": "error",
                "message": "Total supply and total demand must be equal."
            }), 400

        result = north_west_corner(
            costs=costs,
            supply=supply,
            demand=demand
        )

        return jsonify({
            "status": "success",
            "method": "North-West Corner",
            "result": result
        }), 200

    except ValueError as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 400

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": f"An unexpected error occurred: {str(error)}"
        }), 500


# ============================================================
# TRANSPORTATION - LEAST COST METHOD
# ============================================================

@app.route("/api/transportation/least-cost", methods=["POST"])
def solve_transportation_least_cost():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "No JSON data was provided."
            }), 400

        costs = data.get("costs")
        supply = data.get("supply")
        demand = data.get("demand")

        if costs is None or supply is None or demand is None:
            return jsonify({
                "status": "error",
                "message": "Costs, supply and demand are required."
            }), 400

        if sum(supply) != sum(demand):
            return jsonify({
                "status": "error",
                "message": "Total supply and total demand must be equal."
            }), 400

        result = least_cost_method(
            costs=costs,
            supply=supply,
            demand=demand
        )

        return jsonify({
            "status": "success",
            "method": "Least Cost Method",
            "result": result
        }), 200

    except ValueError as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 400

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": f"An unexpected error occurred: {str(error)}"
        }), 500


# ============================================================
# TRANSPORTATION - VOGEL'S APPROXIMATION METHOD
# ============================================================

@app.route("/api/transportation/vogel", methods=["POST"])
def solve_transportation_vogel():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "No JSON data was provided."
            }), 400

        costs = data.get("costs")
        supply = data.get("supply")
        demand = data.get("demand")

        if costs is None or supply is None or demand is None:
            return jsonify({
                "status": "error",
                "message": "Costs, supply and demand are required."
            }), 400

        if sum(supply) != sum(demand):
            return jsonify({
                "status": "error",
                "message": "Total supply and total demand must be equal."
            }), 400

        result = vogel_approximation_method(
            costs=costs,
            supply=supply,
            demand=demand
        )

        return jsonify({
            "status": "success",
            "method": "Vogel's Approximation Method",
            "result": result
        }), 200

    except ValueError as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 400

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": f"An unexpected error occurred: {str(error)}"
        }), 500


# ============================================================
# TRANSPORTATION - MODI METHOD
# ============================================================

@app.route("/api/transportation/modi", methods=["POST"])
def solve_transportation_modi():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "No JSON data was provided."
            }), 400

        costs = data.get("costs")
        supply = data.get("supply")
        demand = data.get("demand")

        if costs is None or supply is None or demand is None:
            return jsonify({
                "status": "error",
                "message": "Costs, supply and demand are required."
            }), 400

        if sum(supply) != sum(demand):
            return jsonify({
                "status": "error",
                "message": "Total supply and total demand must be equal."
            }), 400

        result = modi_method(
            costs=costs,
            supply=supply,
            demand=demand
        )

        return jsonify({
            "status": "success",
            "method": "MODI Method",
            "result": result
        }), 200

    except ValueError as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 400

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": f"An unexpected error occurred: {str(error)}"
        }), 500


if __name__ == "__main__":
    app.run(debug=True)