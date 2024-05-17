export type Result<T, E> = {
    ok: true
    val: T
} | {
    ok: false
    val: E
}

export const Ok = <T>(val: T): Result<T, never> => ({
    ok: true,
    val
})

export const Err = <E>(val: E): Result<never, E> => ({
    ok: false,
    val
})