from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

from algorithms.lpp import solve_graphical_lpp
from algorithms.transportation import (
    north_west_corner,
    least_cost_method,
    vogel_approximation_method,
    modi_method
)

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

import io


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
# LPP - EXCEL PRACTICAL EXPORT
# ============================================================

@app.route("/api/lpp/export-excel", methods=["POST"])
def export_lpp_excel():
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
        problem_statement = data.get("problem_statement", "")

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

        # --------------------------------------------------------
        # Solve LPP first
        # --------------------------------------------------------

        result = solve_graphical_lpp(
            objective_coefficients=objective,
            constraints=constraints,
            optimization=optimization
        )

        # --------------------------------------------------------
        # Create Workbook
        # --------------------------------------------------------

        workbook = Workbook()

        # --------------------------------------------------------
        # Styles
        # --------------------------------------------------------

        title_fill = PatternFill(
            fill_type="solid",
            fgColor="17365D"
        )

        section_fill = PatternFill(
            fill_type="solid",
            fgColor="5B9BD5"
        )

        header_fill = PatternFill(
            fill_type="solid",
            fgColor="D9EAF7"
        )

        white_font = Font(
            color="FFFFFF",
            bold=True,
            size=14
        )

        section_font = Font(
            color="FFFFFF",
            bold=True,
            size=11
        )

        header_font = Font(
            bold=True
        )

        thin_border = Border(
            left=Side(style="thin"),
            right=Side(style="thin"),
            top=Side(style="thin"),
            bottom=Side(style="thin")
        )

        # ========================================================
        # SHEET 1 - PROBLEM
        # ========================================================

        problem_sheet = workbook.active
        problem_sheet.title = "Problem"

        problem_sheet["A1"] = "OPERATION RESEARCH SMART SOLVER"
        problem_sheet["A1"].fill = title_fill
        problem_sheet["A1"].font = white_font
        problem_sheet.merge_cells("A1:F1")

        problem_sheet["A3"] = "Problem Statement"
        problem_sheet["A3"].fill = section_fill
        problem_sheet["A3"].font = section_font

        problem_sheet["A4"] = problem_statement or "LPP Graphical Problem"

        problem_sheet["A6"] = "Optimization"
        problem_sheet["B6"] = (
            "Maximize"
            if optimization.lower() == "max"
            else "Minimize"
        )

        problem_sheet["A8"] = "Objective Coefficients"
        problem_sheet["A8"].fill = section_fill
        problem_sheet["A8"].font = section_font

        for index, value in enumerate(objective, start=1):
            problem_sheet.cell(
                row=9,
                column=index,
                value=f"X{index}"
            )

            problem_sheet.cell(
                row=10,
                column=index,
                value=value
            )

            problem_sheet.cell(
                row=9,
                column=index
            ).font = header_font

            problem_sheet.cell(
                row=9,
                column=index
            ).fill = header_fill

        # ========================================================
        # SHEET 2 - FORMULATION
        # ========================================================

        formulation_sheet = workbook.create_sheet("Formulation")

        formulation_sheet["A1"] = "MATHEMATICAL FORMULATION"
        formulation_sheet["A1"].fill = title_fill
        formulation_sheet["A1"].font = white_font
        formulation_sheet.merge_cells("A1:F1")

        objective_text = " + ".join(
            f"{value}X{index + 1}"
            for index, value in enumerate(objective)
        )

        formulation_sheet["A3"] = (
            f"{'Maximize' if optimization.lower() == 'max' else 'Minimize'} "
            f"Z = {objective_text}"
        )

        formulation_sheet["A5"] = "Subject To"
        formulation_sheet["A5"].fill = section_fill
        formulation_sheet["A5"].font = section_font

        for row_index, constraint in enumerate(
            constraints,
            start=6
        ):
            coefficients = constraint.get("coefficients", [])
            relation = constraint.get(
                "relation",
                constraint.get("operator", "<=")
            )
            rhs = constraint.get(
                "rhs",
                constraint.get("value", 0)
            )

            expression = " + ".join(
                f"{value}X{index + 1}"
                for index, value in enumerate(coefficients)
            )

            formulation_sheet.cell(
                row=row_index,
                column=1,
                value=f"{expression} {relation} {rhs}"
            )

        non_negative_row = 7 + len(constraints)

        formulation_sheet.cell(
            row=non_negative_row,
            column=1,
            value="X1, X2, ... ≥ 0"
        )

        # ========================================================
        # SHEET 3 - C1 C2 TABLE
        # ========================================================

        coefficient_sheet = workbook.create_sheet(
            "C1 C2 Table"
        )

        coefficient_sheet["A1"] = "CONSTRAINT COEFFICIENT TABLE"
        coefficient_sheet["A1"].fill = title_fill
        coefficient_sheet["A1"].font = white_font
        coefficient_sheet.merge_cells("A1:F1")

        coefficient_sheet.cell(
            row=3,
            column=1,
            value="Constraint"
        )

        for index in range(len(objective)):
            coefficient_sheet.cell(
                row=3,
                column=index + 2,
                value=f"C{index + 1}"
            )

        coefficient_sheet.cell(
            row=3,
            column=len(objective) + 2,
            value="Sign"
        )

        coefficient_sheet.cell(
            row=3,
            column=len(objective) + 3,
            value="RHS"
        )

        for cell in coefficient_sheet[3]:
            cell.fill = header_fill
            cell.font = header_font
            cell.border = thin_border

        for row_index, constraint in enumerate(
            constraints,
            start=4
        ):
            coefficients = constraint.get("coefficients", [])

            coefficient_sheet.cell(
                row=row_index,
                column=1,
                value=f"R{row_index - 3}"
            )

            for col_index, value in enumerate(
                coefficients,
                start=2
            ):
                coefficient_sheet.cell(
                    row=row_index,
                    column=col_index,
                    value=value
                )

            relation = constraint.get(
                "relation",
                constraint.get("operator", "<=")
            )

            rhs = constraint.get(
                "rhs",
                constraint.get("value", 0)
            )

            coefficient_sheet.cell(
                row=row_index,
                column=len(objective) + 2,
                value=relation
            )

            coefficient_sheet.cell(
                row=row_index,
                column=len(objective) + 3,
                value=rhs
            )

            for cell in coefficient_sheet[row_index]:
                cell.border = thin_border

        # ========================================================
        # SHEET 4 - CORNER POINT ANALYSIS
        # ========================================================

        corner_sheet = workbook.create_sheet(
            "Corner Points"
        )

        corner_sheet["A1"] = "CORNER POINT ANALYSIS"
        corner_sheet["A1"].fill = title_fill
        corner_sheet["A1"].font = white_font
        corner_sheet.merge_cells("A1:F1")

        corner_sheet["A3"] = "Point"
        corner_sheet["B3"] = "X1"
        corner_sheet["C3"] = "X2"
        corner_sheet["D3"] = "Objective Z"

        for cell in corner_sheet[3]:
            cell.fill = header_fill
            cell.font = header_font
            cell.border = thin_border

        corner_points = result.get("corner_points", [])

        optimal_solution = result.get(
            "optimal_solution",
            {}
        )

        optimal_x1 = optimal_solution.get(
            "x1",
            optimal_solution.get("X1")
        )

        optimal_x2 = optimal_solution.get(
            "x2",
            optimal_solution.get("X2")
        )

        for index, point in enumerate(
            corner_points,
            start=4
        ):
            x1 = point[0]
            x2 = point[1]

            z_value = sum(
                objective[i] * point[i]
                for i in range(
                    min(len(objective), len(point))
                )
            )

            corner_sheet.cell(
                row=index,
                column=1,
                value=chr(64 + index - 3)
            )

            corner_sheet.cell(
                row=index,
                column=2,
                value=x1
            )

            corner_sheet.cell(
                row=index,
                column=3,
                value=x2
            )

            corner_sheet.cell(
                row=index,
                column=4,
                value=z_value
            )

            for cell in corner_sheet[index]:
                cell.border = thin_border

        # ========================================================
        # SHEET 5 - FINAL SOLUTION
        # ========================================================

        solution_sheet = workbook.create_sheet(
            "Final Solution"
        )

        solution_sheet["A1"] = "FINAL OPTIMAL SOLUTION"
        solution_sheet["A1"].fill = title_fill
        solution_sheet["A1"].font = white_font
        solution_sheet.merge_cells("A1:D1")

        solution_sheet["A3"] = "Variable"
        solution_sheet["B3"] = "Optimal Value"

        solution_sheet["A3"].fill = header_fill
        solution_sheet["B3"].fill = header_fill

        solution_sheet["A4"] = "X1"
        solution_sheet["B4"] = optimal_x1

        solution_sheet["A5"] = "X2"
        solution_sheet["B5"] = optimal_x2

        optimal_z = result.get(
            "optimal_value",
            result.get("optimal_z", "")
        )

        solution_sheet["A7"] = (
            "Maximum Z"
            if optimization.lower() == "max"
            else "Minimum Z"
        )

        solution_sheet["B7"] = optimal_z

        for row in range(3, 8):
            for col in range(1, 3):
                solution_sheet.cell(
                    row=row,
                    column=col
                ).border = thin_border

        # ========================================================
        # SHEET 6 - EXCEL SOLVER SETUP
        # ========================================================

        solver_sheet = workbook.create_sheet(
            "Solver Setup"
        )

        solver_sheet["A1"] = "EXCEL SOLVER SETUP"
        solver_sheet["A1"].fill = title_fill
        solver_sheet["A1"].font = white_font
        solver_sheet.merge_cells("A1:F1")

        solver_sheet["A3"] = "Solver Configuration"
        solver_sheet["A3"].fill = section_fill
        solver_sheet["A3"].font = section_font

        solver_sheet["A5"] = "Set Objective"
        solver_sheet["B5"] = "B7"

        solver_sheet["A6"] = "To"
        solver_sheet["B6"] = (
            "Max"
            if optimization.lower() == "max"
            else "Min"
        )

        solver_sheet["A7"] = "By Changing Variable Cells"
        solver_sheet["B7"] = "B4:B5"

        solver_sheet["A9"] = "Constraints"
        solver_sheet["A9"].fill = section_fill
        solver_sheet["A9"].font = section_font

        for index, constraint in enumerate(
            constraints,
            start=10
        ):
            solver_sheet.cell(
                row=index,
                column=1,
                value=f"Constraint {index - 9}"
            )

            coefficients = constraint.get(
                "coefficients",
                []
            )

            relation = constraint.get(
                "relation",
                constraint.get("operator", "<=")
            )

            rhs = constraint.get(
                "rhs",
                constraint.get("value", 0)
            )

            solver_sheet.cell(
                row=index,
                column=2,
                value=(
                    f"{coefficients} "
                    f"{relation} {rhs}"
                )
            )

        solver_sheet["A15"] = "Solver Method"
        solver_sheet["B15"] = "Simplex LP"

        # ========================================================
        # COLUMN WIDTHS
        # ========================================================

        for sheet in workbook.worksheets:
            for column_cells in sheet.columns:
                column_letter = get_column_letter(
                    column_cells[0].column
                )

                max_length = 0

                for cell in column_cells:
                    if cell.value is not None:
                        max_length = max(
                            max_length,
                            len(str(cell.value))
                        )

                sheet.column_dimensions[
                    column_letter
                ].width = min(
                    max(max_length + 3, 15),
                    60
                )

            for row in sheet.iter_rows():
                for cell in row:
                    cell.alignment = Alignment(
                        vertical="center"
                    )

        # --------------------------------------------------------
        # Save workbook to memory
        # --------------------------------------------------------

        excel_file = io.BytesIO()

        workbook.save(excel_file)

        excel_file.seek(0)

        return send_file(
            excel_file,
            as_attachment=True,
            download_name="OR_LPP_Practical.xlsx",
            mimetype=(
                "application/vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            )
        )

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
        }), 400

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": f"An unexpected error occurred: {str(error)}"
        }), 500


if __name__ == "__main__":
    app.run(debug=True)