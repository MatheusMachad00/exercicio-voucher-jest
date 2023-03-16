import { jest } from "@jest/globals";
import voucherService from "services/voucherService";
import voucherRepository from "repositories/voucherRepository";

describe("Voucher service unit tests", () => {
  it("Should create a new voucher ", async () => {
    const voucher = {
      code: "test",
      discount: 10,
    };

    jest.spyOn(voucherRepository, "getVoucherByCode").mockReturnValueOnce(null);
    jest
      .spyOn(voucherRepository, "createVoucher")
      .mockImplementationOnce((): any => {});

    const result = await voucherService.createVoucher(
      voucher.code,
      voucher.discount
    );
    expect(result).toBeUndefined();
  });

  it("Should not create a new voucher", async () => {
    expect(async () => {
      const voucher = {
        code: "test",
        discount: 200,
      };

      jest
        .spyOn(voucherRepository, "getVoucherByCode")
        .mockReturnValueOnce(null);
      await voucherService.createVoucher(voucher.code, voucher.discount);
    }).rejects.toBeInstanceOf(Error);
  });

  it("Should return an error of conflict", async () => {
    expect(async () => {
      const voucher = {
        id: 1,
        code: "test",
        discount: 10,
        used: false,
      };

      jest
        .spyOn(voucherRepository, "getVoucherByCode")
        .mockImplementationOnce((): any => {
          return voucher;
        });

      await voucherService.createVoucher(voucher.code, voucher.discount);
    }).rejects.toMatchObject({
      type: "conflict",
      message: "Voucher already exist.",
    });
  });

  it("Should not apply discount for values below 100", async () => {
    const voucher = {
      code: "test",
      discount: 10,
    };
    const amount = 99;

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: voucher.code,
          discount: voucher.discount,
          used: false,
        };
      });

    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementationOnce((): any => {});

    const order = await voucherService.applyVoucher(voucher.code, amount);
    expect(order.amount).toBe(amount);
    expect(order.discount).toBe(voucher.discount);
    expect(order.finalAmount).toBe(amount);
    expect(order.applied).toBe(false);
  });

  it("Should return data after apply a voucher", async () => {
    const voucher = {
      id: 1,
      code: "test",
      discount: 50,
      used: false,
    };
    const amout = 200;

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return voucher;
      });

    const result = await voucherService.applyVoucher(voucher.code, amout);

    expect(result).toMatchObject({
      amount: 200,
      discount: 50,
      finalAmount: 100,
      applied: true,
    });
  });

  /* it("Should not be able to use a voucher that was used", async () => {

    const voucher = {
      id: 1,
      code: "test",
      discount: 30,
      used: false,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return voucher;
      });


  }); */
});

/* {
  "amount": 200,
  "discount": 50,
  "finalAmount": 100,
  "applied": true
} */
