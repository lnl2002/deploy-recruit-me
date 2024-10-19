/**
 * @swagger
 * /api/v1/meeting-room:
 *   put:
 *     summary: Chấp thuận/Từ chối lịch họp
 *     description: Endpoint này cho phép quản trị viên chấp thuận hoặc từ chối một yêu cầu đặt lịch họp.
 *     tags:
 *       - Meeting Room
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               meetingRoomId:
 *                 type: string
 *               participantId:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 status:
 *                   type: number
 *                   example: 200
 *       400:
 *         description: Yêu cầu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Yêu cầu không hợp lệ"
 *                 status:
 *                   type: string
 *                   example: "error"
 *       500:
 *         description: Lỗi hệ thống
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 data:
 *                   type: null
 *                   example: null
 */
