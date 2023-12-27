export const nkMessage = {
    title: {},
    notice: {},
    message: {
        authLogin: {
            key: 'nk.message.authLogin',
            message: 'Đăng nhập thành công',
        },
        ok: {
            key: 'nk.message.ok',
            message: 'Thành công',
        },
        logout: {
            key: 'nk.message.logout',
            message: 'Đăng xuất thành công',
        },
        sendResetPassword: {
            key: 'nk.message.sendResetPassword',
            message: 'Gửi email thành công',
        },
    },
    error: {
        unauthorized: {
            key: 'nk.error.unauthorized',
            message: 'Bạn không có quyền truy cập',
        },
        supplyQuantityNotEnough: {
            key: 'nk.error.supplyQuantityNotEnough',
            message: 'Số lượng vật tư không đủ {{quantity}}',
        },
        notFound: {
            key: 'nk.error.notFound',
            message: '{{entity}} không tồn tại',
        },
        invalidInput: {
            key: 'nk.error.invalidInput',
            message: 'Dữ liệu không hợp lệ',
        },
        passwordPolicy: {
            key: 'nk.error.passwordPolicy',
            message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số',
        },

        passwordNotMatch: {
            key: 'nk.error.passwordNotMatch',
            message: 'Mật khẩu không khớp',
        },
        permissionDenied: {
            key: 'nk.error.permissionDenied',
            message: 'Bạn không có quyền thực hiện hành động này',
        },
        fieldTaken: {
            key: 'nk.error.fieldTaken',
            message: '{{field}} đã được sử dụng',
        },
        fileRequired: {
            key: 'nk.error.fileRequired',
            message: 'File không được để trống',
        },
        fileTooLarge: {
            key: 'nk.error.fileTooLarge',
            message: 'File quá lớn, vui lòng chọn file có dung lượng dưới {{size}}MB',
        },
        fileExtension: {
            key: 'nk.error.fileExtension',
            message: 'File không đúng định dạng cho phép: {{extension}}',
        },
        internalServerError: {
            key: 'nk.error.internalServerError',
            message: 'Lỗi hệ thống',
        },
        importInventoryStatus: {
            key: 'nk.error.importInventoryStatus',
            message: 'Không thể chỉnh sửa phiếu nhập kho đã duyệt',
        },
        importPlanStatus: {
            key: 'nk.error.importPlanStatus',
            message: 'Không thể chỉnh sửa kế hoạch nhập kho đã duyệt',
        },
        importPlanSubmitStatus: {
            key: 'nk.error.importPlanStatus',
            message: 'Không thể gửi kế hoạch nhập kho đã duyệt',
        },
        importInventoryItemOnlySupplyOrEquipment: {
            key: 'nk.error.importInventoryItemOnlySupplyOrEquipment',
            message: 'Chỉ được nhập kho vật tư hoặc thiết bị',
        },
        importRequestItemOnlySupplyOrEquipmentOrNull: {
            key: 'nk.error.importRequestItemOnlySupplyOrEquipmentOrNull',
            message: 'Chỉ được yêu cầu nhập kho vật tư hoặc thiết bị hoặc không nhập',
        },
        equipmentMustBeOne: {
            key: 'nk.error.equipmentMustBeOne',
            message: 'Thiết bị số lượng phải là 1',
        },
        equipmentMustBeDraft: {
            key: 'nk.error.equipmentMustBeDraft',
            message: 'Thiết bị phải ở trạng thái nháp',
        },
        equipmentMustBeIdle: {
            key: 'nk.error.equipmentMustBeIdle',
            message: 'Thiết bị phải ở trạng thái sẵn sàng',
        },
        equipmentMustNotBeDraft: {
            key: 'nk.error.equipmentMustNotBeDraft',
            message: 'Thiết bị không được ở trạng thái nháp',
        },
        equipmentQuantityMustBeOne: {
            key: 'nk.error.equipmentQuantityMustBeOne',
            message: 'Số lượng thiết bị phải là 1',
        },
        importInventoryItemEmpty: {
            key: 'nk.error.importInventoryItemEmpty',
            message: 'Danh sách vật tư và thiết bị không được để trống',
        },
        importDataInRowMissing: {
            key: 'nk.error.importDataInRowMissing',
            message: 'Dữ liệu thiếu ở dòng {{row}} thiếu trường {{field}}',
        },
        importDataRowInvalid: {
            key: 'nk.error.importDataRowInvalid',
            message: 'Dữ liệu thiếu ở dòng {{row}} trường {{field}} không hợp lệ: {{detail}}',
        },
        importPlanItemEmpty: {
            key: 'nk.error.importPlanItemEmpty',
            message: 'Danh sách vật tư và thiết bị không được để trống',
        },
        importRequestMustBeDraft: {
            key: 'nk.error.importRequestMustBeDraft',
            message: 'Phiếu nhập kho phải ở trạng thái nháp',
        },
        importRequestMustBeRequest: {
            key: 'nk.error.importRequestMustBeRequest',
            message: 'Phiếu nhập kho phải ở trạng thái yêu cầu',
        },
        importRequestItemEmpty: {
            key: 'nk.error.importRequestItemEmpty',
            message: 'Danh sách vật tư và thiết bị không được để trống',
        },
        repairReportMustBeFixing: {
            key: 'nk.error.repairReportMustBeFixing',
            message: 'Báo cáo sửa chữa phải ở trạng thái đang sửa chữa',
        },
        exportInventoryItemOnlySupplyOrEquipment: {
            key: 'nk.error.exportInventoryItemOnlySupplyOrEquipment',
            message: 'Chỉ được xuất kho vật tư hoặc thiết bị',
        },
        exportInventoryStatus: {
            key: 'nk.error.exportInventoryStatus',
            message: 'Không thể chỉnh sửa phiếu xuất kho đã duyệt',
        },
        exportInventoryItemEmpty: {
            key: 'nk.error.exportInventoryItemEmpty',
            message: 'Danh sách vật tư và thiết bị không được để trống',
        },
        importRequestMustBeUpdated: {
            key: 'nk.error.importRequestMustBeUpdated',
            message: 'Phiếu nhập kho phải ở trạng thái cập nhật',
        },
        importRequestItemMustBeNotEmpty: {
            key: 'nk.error.importRequestItemMustBeNotEmpty',
            message: 'Danh sách vật tư và thiết bị không được để trống',
        },
        repairReportItemNotCompleted: {
            key: 'nk.error.repairReportItemNotCompleted',
            message: 'Báo cáo sửa chữa chưa hoàn thành',
        },
        repairReportItemEmpty: {
            key: 'nk.error.repairReportItemEmpty',
            message: 'Danh sách vật tư và thiết bị không được để trống',
        },
        repairReportImportRequestNotDone: {
            key: 'nk.error.repairReportImportRequestNotDone',
            message: 'Phiếu nhập kho chưa hoàn thành',
        },
        exportInventoryItemQuantityNotGreaterImportRequestQuantity: {
            key: 'nk.error.exportInventoryItemQuantityNotGreaterImportRequestQuantity',
            message: 'Số lượng xuất kho không được lớn hơn số lượng yêu cầu',
        },
        repairReportItemNotCompletedOrCancelled: {
            key: 'nk.error.repairReportItemNotCompletedOrCancelled',
            message: 'Báo cáo sửa chữa chưa hoàn thành hoặc đã hủy',
        },
        repairReportOverlap: {
            key: 'nk.error.repairReportOverlap',
            message: 'Báo cáo sửa chữa cho thiết bị trùng ngày: từ {{from}} đến {{to}}',
        },
        dataContext: {
            key: 'nk.error.dataContext',
            message: `{{data}}`,
        },
    },
    action: {},
};
