import { jest } from "@jest/globals";
import { Voucher } from "@prisma/client";
import { any } from "joi";
import voucherRepository from "repositories/voucherRepository";
import voucherService from "services/voucherService";

describe("Voucher service unit test",  () => {
    const MIN_VALUE_FOR_DISCOUNT = 100;
    const code = "123test";
    const discount = 10;
    const voucher = { 
        id: 1, 
        code, 
        discount, 
        used: false 
    };
    const amount = MIN_VALUE_FOR_DISCOUNT;
    const expectedError = {
        type: expect.any(String),
        message: expect.any(String)
    };

    it("createVoucher function should return an error when code already exist",async () => {
        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValue({} as any);

        await expect(voucherService.createVoucher(code, discount)).rejects.toEqual(expectedError);
    });

    it("createVoucher function should create voucher",async () => {
        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValue(undefined);

        jest.spyOn(voucherRepository, "createVoucher").mockResolvedValue(undefined);

        const result = await voucherService.createVoucher(code, discount);

        expect(result).toBeUndefined();
    });

    it("applyVoucher function should return an error if voucher does not exist",async () => {
        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValue(undefined);

        await expect(voucherService.applyVoucher(code, MIN_VALUE_FOR_DISCOUNT)).rejects.toEqual(expectedError);
    });

    it("applyVoucher function should not apply voucher if amount given is invalid",async () => {
        const invalidAmount = MIN_VALUE_FOR_DISCOUNT - 10;

        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValue(voucher);

        const result = await voucherService.applyVoucher(code, invalidAmount);

        expect(result).toEqual({
            amount: invalidAmount,
            discount: voucher.discount,
            finalAmount: invalidAmount,
            applied: false
        });
    });

    it("applyVoucher function should not apply voucher if voucher exist",async () => {
        const invalidVoucher = {...voucher, used: true };

        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValue(invalidVoucher);

        const result = await voucherService.applyVoucher(code, amount);

        expect(result).toEqual({
            amount, 
            discount: voucher.discount,
            finalAmount: amount,
            applied: false
        });
    });

    it("applyVoucher function should used voucher",async () => {
        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValue(voucher);

        jest.spyOn(voucherRepository, "useVoucher").mockResolvedValue({} as any);

        const result = await voucherService.applyVoucher(code, amount);

        expect(result).toEqual({
            amount, 
            discount: voucher.discount,
            finalAmount: amount - amount * (voucher.discount/100),
            applied: true
        });
    });
});