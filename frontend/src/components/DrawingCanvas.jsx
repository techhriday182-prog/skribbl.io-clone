import {
    useEffect,
    useRef,
    useState
} from "react";

import socket from "../socket";

const WIDTH = 700;
const HEIGHT = 500;

function DrawingCanvas({
    isDrawer
}) {

    const canvasRef =
        useRef(null);

    const drawing =
        useRef(false);

    const [color, setColor] =
        useState("#000000");

    const [brushSize, setBrushSize] =
        useState(5);

    const [strokes, setStrokes] =
        useState([]);

    useEffect(() => {

        const canvas =
            canvasRef.current;

        const ctx =
            canvas.getContext("2d");

        ctx.fillStyle = "white";

        ctx.fillRect(
            0,
            0,
            WIDTH,
            HEIGHT
        );

    }, []);

    useEffect(() => {

        const handleDraw = (
            stroke
        ) => {

            drawStroke(
                stroke
            );

            setStrokes(
                (previous) => [
                    ...previous,
                    stroke
                ]
            );
        };

        const handleUndo = () => {

            setStrokes(
                (previous) =>
                    previous.slice(
                        0,
                        -1
                    )
            );

            redraw();
        };

        const handleClear = () => {

            setStrokes([]);

            clearCanvas();
        };

        socket.on(
            "draw",
            handleDraw
        );

        socket.on(
            "undo",
            handleUndo
        );

        socket.on(
            "clear-canvas",
            handleClear
        );

        return () => {

            socket.off(
                "draw",
                handleDraw
            );

            socket.off(
                "undo",
                handleUndo
            );

            socket.off(
                "clear-canvas",
                handleClear
            );

        };

    }, [strokes]);

    const getPosition = (event) => {

        const canvas = canvasRef.current;

        const rect =
            canvas.getBoundingClientRect();

        const scaleX =
            canvas.width / rect.width;

        const scaleY =
            canvas.height / rect.height;

        return {
            x:
                (event.clientX - rect.left) *
                    scaleX,

            y:
                (event.clientY - rect.top) *
                    scaleY
        };
    };

    const drawStroke = (
        stroke
    ) => {

        const canvas =
            canvasRef.current;

        const ctx =
            canvas.getContext("2d");

        ctx.strokeStyle =
            stroke.color;

        ctx.lineWidth =
            stroke.width;

        ctx.lineCap = "round";

        ctx.lineJoin = "round";

        ctx.beginPath();

        const points =
            stroke.points;

        if (points.length < 4) {
            return;
        }

        ctx.moveTo(
            points[0],
            points[1]
        );

        for (
            let i = 2;
            i < points.length;
            i += 2
        ) {

            ctx.lineTo(
                points[i],
                points[i + 1]
            );

        }

        ctx.stroke();
    };

    const startDrawing = (
        event
    ) => {

        if (!isDrawer) {
            return;
        }

        drawing.current = true;

        const position =
            getPosition(event);

        const stroke = {
            points: [
                position.x,
                position.y
            ],
            color,
            width: brushSize
        };

        drawing.currentStroke =
            stroke;
    };

    const draw = (
        event
    ) => {

        if (
            !isDrawer ||
            !drawing.current
        ) {
            return;
        }

        const position =
            getPosition(event);

        drawing.currentStroke.points.push(
            position.x,
            position.y
        );

        drawStroke(
            drawing.currentStroke
        );
    };

    const stopDrawing = () => {

        if (
            !isDrawer ||
            !drawing.current
        ) {
            return;
        }

        drawing.current = false;

        socket.emit(
            "draw",
            drawing.currentStroke
        );

        setStrokes(
            (previous) => [
                ...previous,
                drawing.currentStroke
            ]
        );

        drawing.currentStroke = null;
    };

    const clearCanvas = () => {

        const canvas =
            canvasRef.current;

        const ctx =
            canvas.getContext("2d");

        ctx.fillStyle = "white";

        ctx.fillRect(
            0,
            0,
            WIDTH,
            HEIGHT
        );
    };

    const redraw = () => {

        clearCanvas();

        for (
            const stroke of strokes
        ) {
            drawStroke(stroke);
        }
    };

    const undo = () => {
        socket.emit("undo");
    };

    const clear = () => {
        socket.emit("clear-canvas");
    };

    return (
        <div className="drawing-container">

            {isDrawer && (
                <div className="toolbar">

                    <input
                        type="color"
                        value={color}
                        onChange={(e) =>
                            setColor(
                                e.target.value
                            )
                        }
                    />

                    <input
                        type="range"
                        min="1"
                        max="30"
                        value={brushSize}
                        onChange={(e) =>
                            setBrushSize(
                                Number(
                                    e.target.value
                                )
                            )
                        }
                    />

                    <button
                        onClick={undo}
                    >
                        Undo
                    </button>

                    <button
                        onClick={clear}
                    >
                        Clear
                    </button>

                </div>
            )}

            <canvas
                ref={canvasRef}
                width={WIDTH}
                height={HEIGHT}
                onMouseDown={
                    startDrawing
                }
                onMouseMove={
                    draw
                }
                onMouseUp={
                    stopDrawing
                }
                onMouseLeave={
                    stopDrawing
                }
                className="drawing-canvas"
            />

        </div>
    );
}

export default DrawingCanvas;