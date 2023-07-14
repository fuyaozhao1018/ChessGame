import React, { useState, useEffect } from 'react';
import './style.css';

const Chessboard = () => {
  const [board, setBoard] = useState([
    'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
    'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',
    'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R',
  ]);

  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('w');
  const [checkmate, setCheckmate] = useState(false);
  const [check, setCheck] = useState(false);

  const isCheckmate = (player) => {
    if (!isKingInCheck(player)) {
      return false;
    }

    // Check if the king can move to any safe square
    const kingPosition = board.findIndex((piece) => piece === (player === 'w' ? 'K' : 'k'));
    const moves = calculatePossibleMoves(kingPosition);

    for (let i = 0; i < moves.length; i++) {
      const tempBoard = [...board];
      const tempPiece = tempBoard[kingPosition];
      tempBoard[kingPosition] = '';
      tempBoard[moves[i]] = tempPiece;

      if (!isKingInCheck(player)) {
        return false;
      }
    }

    return true;
  };

useEffect(() => {
  // Check if the current player is in checkmate
  if (isCheckmate(currentPlayer)) {
    setCheckmate(true);
  }
}, [board, currentPlayer, isCheckmate]);

  

  const handlePieceClick = (position) => {
    const piece = board[position];

    if (checkmate || (check && piece.toLowerCase() === 'k')) {
      return; // Prevent any moves when in checkmate or check
    }

    if (selectedSquare === null && piece !== '' && isPieceColorValid(piece, currentPlayer)) {
      setSelectedSquare(position);
      const moves = calculatePossibleMoves(position);
      setPossibleMoves(moves);
    } else if (selectedSquare !== null && position === selectedSquare) {
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else if (selectedSquare !== null && possibleMoves.includes(position)) {
      movePiece(selectedSquare, position);
      setSelectedSquare(null);
      setPossibleMoves([]);
      setCurrentPlayer(currentPlayer === 'w' ? 'b' : 'w');
      setCheck(isKingInCheck(currentPlayer === 'w' ? 'b' : 'w'));
    }
  };

  const calculatePossibleMoves = (position) => {
    const piece = board[position];
    const row = Math.floor(position / 8);
    const col = position % 8;

    const moves = [];

    switch (piece.toLowerCase()) {
      case 'p':
        // Pawn moves
        moves.push(...calculatePawnMoves(position, piece, row, col));
        // Add logic for en passant
        break;
      case 'r':
        // Rook moves
        moves.push(...calculateRookMoves(position, row, col));
        break;
      case 'n':
        // Knight moves
        moves.push(...calculateKnightMoves(position, row, col));
        break;
      case 'b':
        // Bishop moves
        moves.push(...calculateBishopMoves(position, row, col));
        break;
      case 'q':
        // Queen moves
        moves.push(...calculateQueenMoves(position, row, col));
        break;
      case 'k':
        // King moves
        moves.push(...calculateKingMoves(position, piece, row, col));
        // Add logic for castling
        break;
      default:
        break;
    }

    return moves;
  };

  const calculatePawnMoves = (position, piece, row, col) => {
    const moves = [];
    const direction = piece === 'p' ? 1 : -1; // Forward direction based on piece color

    // One square forward
    if (board[position + 8 * direction] === '') {
      moves.push(position + 8 * direction);
      // Two squares forward on first move
      if ((row === 1 && piece === 'p') || (row === 6 && piece === 'P')) {
        if (board[position + 16 * direction] === '') {
          moves.push(position + 16 * direction);
        }
      }
    }

    // Capture moves
    if (col > 0 && isOpponentPiece(position + 7 * direction)) {
      moves.push(position + 7 * direction);
    }
    if (col < 7 && isOpponentPiece(position + 9 * direction)) {
      moves.push(position + 9 * direction);
    }

    return moves;
  };

  const calculateRookMoves = (position, row, col) => {
    const moves = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, down, left, right

    directions.forEach(([dx, dy]) => {
      for (let i = 1; i < 8; i++) {
        const newRow = row + i * dx;
        const newCol = col + i * dy;
        const newPosition = newRow * 8 + newCol;

        if (isOutOfBounds(newRow, newCol) || isSameColorPiece(newPosition)) {
          break;
        }

        moves.push(newPosition);

        if (isOpponentPiece(newPosition)) {
          break;
        }
      }
    });

    return moves;
  };

  const calculateKnightMoves = (position, row, col) => {
    const moves = [];
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    offsets.forEach(([dx, dy]) => {
      const newRow = row + dx;
      const newCol = col + dy;
      const newPosition = newRow * 8 + newCol;

      if (!isOutOfBounds(newRow, newCol) && !isSameColorPiece(newPosition)) {
        moves.push(newPosition);
      }
    });

    return moves;
  };

  const calculateBishopMoves = (position, row, col) => {
    const moves = [];
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // Diagonal directions

    directions.forEach(([dx, dy]) => {
      for (let i = 1; i < 8; i++) {
        const newRow = row + i * dx;
        const newCol = col + i * dy;
        const newPosition = newRow * 8 + newCol;

        if (isOutOfBounds(newRow, newCol) || isSameColorPiece(newPosition)) {
          break;
        }

        moves.push(newPosition);

        if (isOpponentPiece(newPosition)) {
          break;
        }
      }
    });

    return moves;
  };

  const calculateQueenMoves = (position, row, col) => {
    const rookMoves = calculateRookMoves(position, row, col);
    const bishopMoves = calculateBishopMoves(position, row, col);
    return [...rookMoves, ...bishopMoves];
  };

  const calculateKingMoves = (position, piece, row, col) => {
    const moves = [];
    const offsets = [
      [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
    ];

    offsets.forEach(([dx, dy]) => {
      const newRow = row + dx;
      const newCol = col + dy;
      const newPosition = newRow * 8 + newCol;

      if (!isOutOfBounds(newRow, newCol) && !isSameColorPiece(newPosition)) {
        moves.push(newPosition);
      }
    });

    return moves;
  };

  const isOutOfBounds = (row, col) => {
    return row < 0 || row >= 8 || col < 0 || col >= 8;
  };

  const isSameColorPiece = (position) => {
    if (!selectedSquare) return false;

    const piece = board[position];
    const selectedPiece = board[selectedSquare];
    return piece !== '' && piece.toLowerCase() === selectedPiece.toLowerCase();
  };

  const isOpponentPiece = (position) => {
    if (!selectedSquare) return false;
  
    const piece = board[position];
    const selectedPiece = board[selectedSquare];
    return piece !== '' && piece.toLowerCase() !== selectedPiece.toLowerCase() && isPieceColorValid(piece, currentPlayer);
  };
  

  const isPieceColorValid = (piece, currentPlayer) => {
    return (piece.toLowerCase() === piece && currentPlayer === 'b') ||
      (piece.toUpperCase() === piece && currentPlayer === 'w');
  };

  const isKingInCheck = (player) => {
    const kingPosition = board.findIndex((piece) => piece === (player === 'w' ? 'K' : 'k'));
    const opponentPlayer = player === 'w' ? 'b' : 'w';

    // Check if any opponent piece can capture the king
    for (let i = 0; i < 64; i++) {
      const piece = board[i];
      if (piece !== '' && piece.toLowerCase() !== 'k' && piece.toLowerCase() !== 'p' && isPieceColorValid(piece, opponentPlayer)) {
        const moves = calculatePossibleMoves(i);
        if (moves.includes(kingPosition)) {
          return true;
        }
      }
    }

    return false;
  };



  const movePiece = (from, to) => {
    const updatedBoard = [...board];
    updatedBoard[to] = updatedBoard[from];
    updatedBoard[from] = '';
    setBoard(updatedBoard);
  };

  return (
    <div className="chessboard">
      {board.map((piece, index) => (
        <div
          key={index}
          className={`square ${index % 8 === 0 ? 'clear' : ''} ${possibleMoves.includes(index) ? 'highlight' : ''} ${index === selectedSquare ? 'selected' : ''}`}
          onClick={() => handlePieceClick(index)}
        >
          {piece}
        </div>
      ))}
      {checkmate && <div className="game-status">Checkmate!</div>}
      {check && !checkmate && <div className="game-status">Check!</div>}
    </div>
  );
};

export default Chessboard;
